#!/usr/bin/env python3
"""Stream Clipper: turn a Twitch / Kick / YouTube link into split-screen, captioned vertical clips.

Steps (each is a subcommand; `prepare` runs the first three):
  fetch       details + audio of the VOD (audio only, fast)
  transcribe  fast draft transcript + loud spikes -> transcript.txt for picking moments
  render      cuts each picked moment straight from the stream, re-transcribes it for accurate
              word-timed captions, and renders 1080x1920 MP4s plus clips.zip

Picking the moments is done by Claude reading transcript.txt and writing moments.json:
  [{"start": 123.0, "end": 171.0, "title": "...", "hook": "...", "score": 88, "why": "..."}]
"""
import argparse
import json
import math
import os
import random
import re
import shutil
import subprocess
import sys
import time
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CACHE = ROOT / "cache"
FONTS = ROOT / "fonts"
OW, OH, HALF, FPS = 1080, 1920, 960, 30


def log(*a):
    print("[clip]", *a, flush=True)


def ffmpeg_env():
    """ffmpeg only honours lower-case http_proxy; give it the proxy this environment uses."""
    env = dict(os.environ)
    proxy = env.get("HTTPS_PROXY") or env.get("https_proxy")
    if proxy and not env.get("http_proxy"):
        env["http_proxy"] = proxy
    return env


def net_args():
    """Trust the environment's CA bundle for network inputs (never disables verification)."""
    ca = os.environ.get("SSL_CERT_FILE")
    return ["-ca_file", ca] if ca and os.path.exists(ca) else []


def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, env=ffmpeg_env(), **kw)
    if r.returncode != 0:
        tail = "\n".join((r.stderr or r.stdout).strip().splitlines()[-6:])
        raise RuntimeError(f"{Path(cmd[0]).name} failed: {tail}")
    return r.stdout


def ytdlp_base(job):
    args = ["yt-dlp", "--no-warnings", "--no-playlist"]
    cookies = os.environ.get("CLIP_COOKIES")
    if cookies and os.path.exists(cookies):
        args += ["--cookies", cookies]
    ca = net_args()
    if ca:  # yt-dlp hands HLS downloads to ffmpeg; let ffmpeg trust the environment's CA bundle
        args += ["--downloader-args", "ffmpeg_i:" + " ".join(ca)]
    return args


def fmt(t):
    t = max(0, int(t))
    h, m, s = t // 3600, (t % 3600) // 60, t % 60
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"


# ---------------------------------------------------------------- fetch
def cmd_fetch(a):
    job = Path(a.job); job.mkdir(parents=True, exist_ok=True)
    t0 = time.time()
    info = json.loads(run(ytdlp_base(job) + ["-J", a.url]))
    if info.get("is_live"):
        raise SystemExit("This stream is still live. Use the link to the VOD after it ends.")
    keep = {k: info.get(k) for k in ("id", "title", "uploader", "channel", "duration", "extractor_key", "webpage_url", "width", "height")}
    # Pick the best video format up to 1080p for later section cuts.
    vids = [f for f in info.get("formats", []) if f.get("vcodec") not in (None, "none") and (f.get("height") or 0) <= 1080]
    vids.sort(key=lambda f: ((f.get("height") or 0), (f.get("fps") or 0), (f.get("tbr") or 0)))
    keep["video_format"] = vids[-1]["format_id"] if vids else "b"
    keep["src_w"] = vids[-1].get("width") if vids else info.get("width")
    keep["src_h"] = vids[-1].get("height") if vids else info.get("height")
    keep["url"] = a.url
    (job / "info.json").write_text(json.dumps(keep, indent=2))
    log(f"{keep['title']!r} by {keep.get('uploader') or keep.get('channel')} · {fmt(keep['duration'] or 0)} · {keep['extractor_key']}")
    if not (job / "audio.done").exists():
        for f in job.glob("audio.*"):
            f.unlink()
        run(ytdlp_base(job) + ["-N", "8", "-f", "Audio_Only/ba[ext=m4a]/ba/w", "-o", str(job / "audio.%(ext)s"), a.url])
        (job / "audio.done").write_text("ok")
    log(f"audio downloaded in {time.time() - t0:.0f}s")


def audio_file(job):
    for f in sorted(Path(job).glob("audio.*")):
        if f.suffix not in (".done", ".part", ".ytdl"):
            return f
    raise SystemExit("No audio yet. Run fetch first.")


# ---------------------------------------------------------------- transcribe
def load_pcm16k(path, start=None, dur=None):
    import numpy as np
    cmd = ["ffmpeg", "-v", "error"]
    if start is not None:
        cmd += ["-ss", f"{start:.3f}"]
    cmd += ["-i", str(path)]
    if dur is not None:
        cmd += ["-t", f"{dur:.3f}"]
    cmd += ["-vn", "-ac", "1", "-ar", "16000", "-f", "s16le", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0


def loud_spikes(pcm, step=0.5):
    import numpy as np
    n = int(16000 * step)
    k = len(pcm) // n
    if k == 0:
        return []
    blocks = pcm[: k * n].reshape(k, n)
    db = 10 * np.log10((blocks ** 2).mean(axis=1) + 1e-10)
    valid = db[db > -90]
    med = float(np.median(valid)) if len(valid) else -40.0
    w = int(30 / step)
    peaks = []
    for i in range(k):
        lo, hi = max(0, i - w), min(k, i + w)
        if db[i] >= db[lo:hi].max() and db[i] > med + 6:
            peaks.append((i * step, round(float(db[i] - med), 1)))
    peaks.sort(key=lambda p: -p[1])
    return sorted(peaks[:40])


def whisper(model_name):
    from faster_whisper import WhisperModel
    return WhisperModel(model_name, device="cpu", compute_type="int8", cpu_threads=os.cpu_count() or 4)


def cmd_transcribe(a):
    job = Path(a.job)
    info = json.loads((job / "info.json").read_text())
    t0 = time.time()
    pcm = load_pcm16k(audio_file(job))
    total = len(pcm) / 16000
    peaks = loud_spikes(pcm)
    log(f"audio {fmt(total)} decoded, {len(peaks)} loud spikes ({time.time() - t0:.0f}s)")
    model = whisper(a.model)
    segs = []
    seg_iter, _ = model.transcribe(pcm, language="en", vad_filter=True, vad_parameters={"min_silence_duration_ms": 700}, beam_size=1, condition_on_previous_text=False, without_timestamps=False)
    last = time.time()
    for s in seg_iter:
        text = s.text.strip()
        if text:
            segs.append({"s": round(s.start, 2), "e": round(s.end, 2), "text": text})
        if time.time() - last > 15:
            el = time.time() - t0
            log(f"transcribed {fmt(s.end)} of {fmt(total)} ({s.end / max(el, 1):.1f}x real time)")
            last = time.time()
    (job / "transcript.json").write_text(json.dumps({"segments": segs, "peaks": peaks, "duration": total}))
    # Compact version for Claude: ~20-second lines.
    lines, cur, cur_s = [], [], None
    for s in segs:
        if cur_s is None:
            cur_s = s["s"]
        cur.append(s["text"])
        if s["e"] - cur_s >= 20:
            lines.append(f"[{int(cur_s)}-{int(s['e'])}] " + " ".join(cur))
            cur, cur_s = [], None
    if cur:
        lines.append(f"[{int(cur_s)}-{int(segs[-1]['e'])}] " + " ".join(cur))
    head = (f"Video: {info.get('title')} — {info.get('uploader') or info.get('channel')} ({fmt(total)})\n"
            f"Loud spikes (seconds, +dB over typical): " + ", ".join(f"{int(t)}s +{d}" for t, d in peaks) + "\n\nTranscript ([start-end] seconds):\n")
    (job / "transcript.txt").write_text(head + "\n".join(lines) + "\n")
    el = time.time() - t0
    log(f"done: {len(segs)} segments in {fmt(el)} ({total / max(el, 1):.1f}x real time) -> {job / 'transcript.txt'}")


# ---------------------------------------------------------------- captions
def ass_time(t):
    t = max(0.0, t)
    h = int(t // 3600); m = int((t % 3600) // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def clean_word(w):
    w = re.sub(r"[^\w'$%!?.,-]", "", w, flags=re.UNICODE)
    return w.upper()


def build_ass(words, path, cy):
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {OW}
PlayResY: {OH}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Anton,104,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,1,0,1,9,3,5,60,60,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = []
    groups = [words[i:i + 3] for i in range(0, len(words), 3)]
    for g in groups:
        for k, w in enumerate(g):
            end = g[k + 1]["t0"] if k + 1 < len(g) else max(w["t1"], w["t0"] + 0.15)
            parts = []
            for j, x in enumerate(g):
                if j == k:
                    parts.append(r"{\c&H3FD2FF&\fscx114\fscy114\t(0,110,\fscx100\fscy100)}" + x["w"] + r"{\c&HFFFFFF&\fscx100\fscy100}")
                else:
                    parts.append(x["w"])
            ev.append(f"Dialogue: 0,{ass_time(w['t0'])},{ass_time(end)},Cap,,0,0,0,,{{\\an5\\pos({OW // 2},{cy})}}" + " ".join(parts))
    Path(path).write_text(head + "\n".join(ev) + "\n")


def clip_words(model, audio, start, dur):
    pcm = load_pcm16k(audio, start, dur)
    segs, _ = model.transcribe(pcm, language="en", word_timestamps=True, vad_filter=False, beam_size=5, condition_on_previous_text=False)
    words = []
    for s in segs:
        for w in s.words or []:
            cw = clean_word(w.word)
            if cw:
                words.append({"w": cw, "t0": max(0.0, w.start), "t1": min(dur, w.end)})
    return words


# ---------------------------------------------------------------- render
def ensure_bg(style):
    f = CACHE / f"bg_{style}.mp4"
    if f.exists():
        return f
    log(f"rendering the {style} background once…")
    subprocess.run(["node", str(ROOT / "bg" / "render-bg.js"), style, str(f), "100"], check=True, cwd=ROOT / "bg")
    return f


def stream_urls(info):
    out = run(ytdlp_base(None) + ["-g", "-f", f"{info['video_format']}+ba/{info['video_format']}/b", info["url"]]).strip().splitlines()
    return [u for u in out if u.startswith("http")]


def safe_name(s):
    s = re.sub(r"[^\w\- ]+", "", s).strip()
    return (s[:60] or "clip")


def cmd_render(a):
    job = Path(a.job)
    info = json.loads((job / "info.json").read_text())
    moments = json.loads(Path(a.moments).read_text())
    moments = [m for m in moments if float(m["end"]) > float(m["start"])]
    if a.max:
        moments = moments[: a.max]
    out = job / "out"; out.mkdir(exist_ok=True)
    bg = ensure_bg(a.bg)
    audio = audio_file(job)
    log("loading the caption model…")
    model = whisper(a.caption_model)
    urls = stream_urls(info)
    sw, sh = info.get("src_w") or 1920, info.get("src_h") or 1080
    if sw / sh >= OW / HALF:
        scale, cw = f"scale=-2:{HALF}", round(HALF * sw / sh / 2) * 2
        crop = f"crop={OW}:{HALF}:{int(a.pan * (cw - OW))}:0"
    else:
        scale, ch = f"scale={OW}:-2", round(OW * sh / sw / 2) * 2
        crop = f"crop={OW}:{HALF}:0:{int((ch - HALF) / 2)}"
    made = []
    t_all = time.time()
    for i, m in enumerate(moments):
        start, end = float(m["start"]), float(m["end"])
        dur = end - start
        name = f"{i + 1:02d} {safe_name(m.get('title', 'clip'))}.mp4"
        dest = out / name
        t0 = time.time()
        try:
            words = clip_words(model, audio, start, dur)
            ass = job / f"cap_{i:02d}.ass"
            build_ass(words, ass, HALF)
            bg_off = random.uniform(0, max(0.0, 100 - dur - 1))
            inputs = []
            for u in urls:
                inputs += [*net_args(), "-ss", f"{start:.3f}", "-t", f"{dur:.3f}", "-i", u]
            inputs += ["-ss", f"{bg_off:.2f}", "-t", f"{dur:.3f}", "-i", str(bg)]
            bgi = len(urls)
            ai = 1 if len(urls) > 1 else 0
            top, bot = ("src", "bg") if a.layout == "top" else ("bg", "src")
            fc = (f"[0:v]{scale},{crop},setsar=1,fps={FPS}[src];"
                  f"[{bgi}:v]scale={OW}:{HALF},setsar=1,fps={FPS}[bg];"
                  f"[{top}][{bot}]vstack=inputs=2,ass={ass}:fontsdir={FONTS},format=yuv420p[v];"
                  f"[{ai}:a]aresample=48000,afade=t=in:d=0.15,afade=t=out:st={max(0, dur - 0.3):.2f}:d=0.3[a]")
            run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
                 "-c:v", "libx264", "-preset", a.preset, "-crf", "21", "-r", str(FPS), "-c:a", "aac", "-b:a", "160k",
                 "-movflags", "+faststart", str(dest)])
            made.append(dest)
            log(f"[{i + 1}/{len(moments)}] {name} ({dur:.0f}s) in {time.time() - t0:.0f}s, {len(words)} caption words")
        except Exception as e:  # keep going with the other clips
            log(f"[{i + 1}/{len(moments)}] FAILED {name}: {e}")
    if made:
        z = job / "clips.zip"
        with zipfile.ZipFile(z, "w", zipfile.ZIP_STORED) as zf:
            for f in made:
                zf.write(f, f.name)
        log(f"{len(made)} clips in {fmt(time.time() - t_all)} -> {out} and {z}")
    else:
        raise SystemExit("No clips were rendered.")


def cmd_prepare(a):
    cmd_fetch(a)
    cmd_transcribe(a)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    f = sub.add_parser("fetch"); f.add_argument("url"); f.add_argument("--job", required=True)
    t = sub.add_parser("transcribe"); t.add_argument("--job", required=True); t.add_argument("--model", default="tiny.en")
    pr = sub.add_parser("prepare", help="fetch + transcribe"); pr.add_argument("url"); pr.add_argument("--job", required=True); pr.add_argument("--model", default="tiny.en")
    r = sub.add_parser("render"); r.add_argument("--job", required=True); r.add_argument("--moments", required=True)
    r.add_argument("--layout", choices=["top", "bottom"], default="top"); r.add_argument("--bg", choices=["runner", "marbles"], default="runner")
    r.add_argument("--pan", type=float, default=0.5); r.add_argument("--max", type=int, default=0)
    r.add_argument("--caption-model", default="small.en"); r.add_argument("--preset", default="veryfast")
    a = p.parse_args()
    {"fetch": cmd_fetch, "transcribe": cmd_transcribe, "prepare": cmd_prepare, "render": cmd_render}[a.cmd](a)


if __name__ == "__main__":
    main()
