// Render motion/film.html to a 1080x1920 H.264 MP4 with a silent AAC track.
// Usage: node motion/render.mjs <film> <out.mp4> [--fps 30] [--still 3.5]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

// require() resolves a globally installed Playwright too; ESM import does not.
const { chromium } = createRequire(import.meta.url)('playwright');

const args = process.argv.slice(2);
const film = args[0] || 'out';
const out = args[1] || `motion/out/${film}.mp4`;
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? Number(args[i + 1]) : d; };
const fps = opt('--fps', 30);
const still = opt('--still', NaN);

const here = path.dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(path.join(here, 'film.html')).href + `?film=${film}`;
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto(url);
await page.evaluate(() => window.ready);
const duration = await page.evaluate(() => window.DURATION);

const grab = async t => {
  const b64 = await page.evaluate(t => { window.renderAt(t); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, t);
  return Buffer.from(b64, 'base64');
};

if (!Number.isNaN(still)) {
  fs.writeFileSync(out, await grab(still));
  await browser.close();
  process.exit(0);
}

const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
  '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo',
  '-shortest', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });

const frames = Math.round(duration * fps);
for (let i = 0; i < frames; i++) {
  const buf = await grab(i / fps);
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % fps === 0) process.stdout.write(`\r${film}: ${i}/${frames}`);
}
ff.stdin.end();
await new Promise((res, rej) => ff.on('close', c => (c ? rej(new Error(`ffmpeg ${c}`)) : res())));
await browser.close();
console.log(`\r${film}: done -> ${out}`);
