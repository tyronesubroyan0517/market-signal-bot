// Renders the original animated "gameplay" backgrounds (1080x960, 30 fps) to MP4 loops
// using headless Chromium + WebCodecs. Usage: node render-bg.js <runner|marbles> <out.mp4> [seconds]
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const [style = "runner", out = "bg.mp4", secs = "100"] = process.argv.slice(2);
const muxerSrc = fs.readFileSync(path.join(__dirname, "node_modules/mp4-muxer/build/mp4-muxer.js"), "utf8");

const pageScript = `
const W = 1080, H = 960, FPS = 30;
function drawMarbles(ctx, t, x, y, w, h) {
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, "#14202b"); g.addColorStop(1, "#0b1218");
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  const rows = 4, gap = h / (rows + 0.6), hues = [14, 42, 168, 198, 280, 330];
  ctx.lineCap = "round";
  for (let r = 0; r < rows; r++) { const yy = y + gap * 0.6 + r * gap, d = r % 2 ? -1 : 1; ctx.strokeStyle = "rgba(255,255,255,0.10)"; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(d > 0 ? x + 100 : x + w - 100, yy); ctx.lineTo(d > 0 ? x + w - 100 : x + 100, yy + gap * 0.5); ctx.stroke(); }
  for (let b = 0; b < 12; b++) {
    const p = ((t * 0.18 + b / 12) % 1) * rows, row = Math.floor(p), f = p - row, d = row % 2 ? -1 : 1;
    const yy = y + gap * 0.6 + row * gap + f * gap * 0.5 - 28, xx = d > 0 ? x + 100 + f * (w - 200) : x + w - 100 - f * (w - 200);
    ctx.fillStyle = "hsl(" + hues[b % 6] + " 85% 60%)"; ctx.beginPath(); ctx.arc(xx, yy, 28, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.beginPath(); ctx.arc(xx - 8, yy - 9, 8, 0, Math.PI * 2); ctx.fill();
  }
}
function drawRunner(ctx, t, x, y, w, h) {
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, "#2b1055"); g.addColorStop(1, "#d6336c");
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  const ground = y + h * 0.78, speed = 520, sx = t * speed;
  for (let i = 0; i < 14; i++) { const bx = x + ((i * 160 - sx * 0.3) % (w + 160) + w + 160) % (w + 160) - 80; ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(bx, y + h * 0.35 + (i % 3) * 40, 90, ground - (y + h * 0.35 + (i % 3) * 40)); }
  ctx.fillStyle = "#130a24"; ctx.fillRect(x, ground, w, y + h - ground);
  ctx.fillStyle = "#ffd23f"; for (let i = 0; i < 20; i++) { const gx = x + ((i * 120 - sx) % (w + 120) + w + 120) % (w + 120) - 60; ctx.fillRect(gx, ground, 60, 8); }
  const period = 1.1, obstacleX = x + w * 0.62, phase = (t % period) / period;
  for (let k = -1; k < 6; k++) { const ox = obstacleX + (k - phase) * speed * period; if (ox < x - 80 || ox > x + w) continue; ctx.fillStyle = "#ff5d8f"; ctx.beginPath(); ctx.moveTo(ox, ground); ctx.lineTo(ox + 40, ground - 70); ctx.lineTo(ox + 80, ground); ctx.fill(); }
  const jump = Math.max(0, Math.sin(Math.min(1, Math.max(0, (phase - 0.25) / 0.55)) * Math.PI)) * 190;
  const px = x + w * 0.62 - 140, py = ground - 80 - jump;
  ctx.save(); ctx.translate(px + 40, py + 40); ctx.rotate(((phase - 0.25) / 0.55) * Math.PI * (jump > 0 ? 1 : 0)); ctx.fillStyle = "#3fe0d0"; ctx.fillRect(-40, -40, 80, 80); ctx.fillStyle = "#0b2b2a"; ctx.fillRect(4, -22, 16, 16); ctx.restore();
}
window.renderBg = async (style, secs) => {
  const draw = style === "marbles" ? drawMarbles : drawRunner;
  const target = new Mp4Muxer.ArrayBufferTarget();
  const muxer = new Mp4Muxer.Muxer({ target, fastStart: "in-memory", video: { codec: "avc", width: W, height: H, frameRate: FPS } });
  let err = null;
  const enc = new VideoEncoder({ output: (c, m) => muxer.addVideoChunk(c, m), error: (e) => (err = e) });
  enc.configure({ codec: "avc1.640028", width: W, height: H, bitrate: 4_000_000, framerate: FPS });
  const canvas = new OffscreenCanvas(W, H), ctx = canvas.getContext("2d");
  for (let f = 0; f < secs * FPS; f++) {
    if (err) throw err;
    draw(ctx, f / FPS, 0, 0, W, H);
    const fr = new VideoFrame(canvas, { timestamp: Math.round((f * 1e6) / FPS), duration: Math.round(1e6 / FPS) });
    enc.encode(fr, { keyFrame: f % 60 === 0 }); fr.close();
    while (enc.encodeQueueSize > 8) await new Promise((r) => setTimeout(r, 1));
  }
  await enc.flush(); muxer.finalize();
  const v = new Uint8Array(target.buffer); let s = "";
  for (let i = 0; i < v.length; i += 32768) s += String.fromCharCode.apply(null, v.subarray(i, i + 32768));
  return btoa(s);
};`;

(async () => {
  // WebCodecs needs a secure context, so serve a blank page from localhost.
  const server = require("http").createServer((q, r) => { r.writeHead(200, { "content-type": "text/html" }); r.end("<!doctype html><title>bg</title>"); });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.addScriptTag({ content: muxerSrc });
  await page.addScriptTag({ content: pageScript });
  const b64 = await page.evaluate(([s, n]) => window.renderBg(s, n), [style, Number(secs)]);
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, Buffer.from(b64, "base64"));
  await browser.close();
  server.close();
  console.log("wrote", out);
})();
