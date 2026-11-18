---
name: clip-stream
description: Turn a Twitch, Kick or YouTube VOD link into split-screen vertical clips (stream on one half, animated gameplay on the other, word-by-word captions) of the best moments, picked by Claude, and send the MP4s to the user. Use when the user pastes a stream or video link and wants clips, highlights, Shorts/TikToks/Reels, or content for a clipping campaign.
---

# Clip a stream from a link

The user pastes a link (often from their phone) and expects finished clips back with no other steps.
Do everything below yourself; only stop to ask when a step genuinely fails.

Scripts live in `clipper/` at the repo root. Put each job in its own folder, e.g. `/tmp/clips/<short-name>`.

## 1. Set up (every new session)

```bash
bash clipper/setup.sh
```

Takes about a minute the first time, seconds after that.

## 2. Fetch and transcribe (run in the background, report progress)

```bash
python3 clipper/clip.py prepare "<LINK>" --job /tmp/clips/<name>
```

- Downloads only the audio (fast), finds loud spikes, and makes a quick draft transcript.
  A 4-hour stream takes roughly 5–15 minutes. Tell the user the title, length and progress in one line as it goes.
- Writes `transcript.txt` (20-second lines with `[start-end]` seconds, plus loud spikes at the top).
- **Live streams** are refused: tell the user to send the VOD link after the stream ends.
- **YouTube** usually refuses cloud servers ("confirm you're not a bot"). If that happens, say so plainly and offer:
  (a) a Twitch/Kick VOD of the same stream, or (b) running this skill on their own computer through Claude Code Remote Control.
  Only use a cookies file if the user provides one themselves (`CLIP_COOKIES=/path/cookies.txt`); never ask them to paste cookies or passwords into chat.

## 3. Pick the moments (you do this — no API key needed)

Read `transcript.txt` (use offset/limit for long files). Pick the best standalone moments for a clipping campaign that pays by views:

- 8–15 clips for a multi-hour stream, fewer for short videos. Default to 10 unless the user asked for a number.
- Each clip 15–90 seconds; choose the length the moment needs (quick reaction 15–25s, story 45–90s).
- Hook in the first 2 seconds, makes sense with no context, ends right after the payoff or reaction.
- Start at the beginning of a sentence just before the setup; end after the punchline, never mid-sentence.
- Prefer moments near loud spikes when the words support it. No overlapping clips. Best first.

Write them to `<job>/moments.json`:

```json
[{"start": 1868, "end": 1933, "title": "12 hours later... ONE MORE MISSION", "hook": "ONE MORE MISSION?!", "score": 90, "why": "Exhausted rage with a clear payoff"}]
```

## 4. Render

```bash
python3 clipper/clip.py render --job /tmp/clips/<name> --moments /tmp/clips/<name>/moments.json --layout top --bg runner
```

- `--layout top|bottom`: stream on top (default) or bottom. `--bg runner|marbles`: the animated gameplay half.
  `--pan 0.0–1.0`: crop position across the stream (0.5 = centre; use ~0.15 or ~0.85 when the facecam is at the side).
- Cuts each moment straight from the stream at up to 1080p, re-transcribes it with a more accurate model for
  word-timed captions, and renders 1080×1920 H.264/AAC MP4s into `<job>/out/`, plus `<job>/clips.zip`.
- Roughly 30–60 seconds of rendering per clip. Run it in the background and report each finished clip.

## 5. Deliver

Send every MP4 in `<job>/out/` with `SendUserFile` (one call with all files, `display: "render"` so they preview on the phone),
with a caption listing each clip's title, length and why it was picked. Mention `clips.zip` only if they want one file.

Then, in a short message: the clip list, total time taken, and anything that failed.
Remind them once that clipping campaigns have their own rules (length, credit/tags, no age-restricted content on some platforms).
