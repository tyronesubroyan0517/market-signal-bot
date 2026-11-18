#!/usr/bin/env bash
# Installs what the Stream Clipper needs in a Claude Code cloud session. Safe to run repeatedly.
set -euo pipefail
cd "$(dirname "$0")"

need_pip=()
python3 -c "import yt_dlp" 2>/dev/null || need_pip+=("yt-dlp[default]")
command -v deno >/dev/null 2>&1 || need_pip+=("deno")
python3 -c "import faster_whisper" 2>/dev/null || need_pip+=("faster-whisper==1.1.1")
python3 -c "import numpy" 2>/dev/null || need_pip+=("numpy")
if [ ${#need_pip[@]} -gt 0 ]; then
  pip install -q "${need_pip[@]}"
else
  pip install -q -U "yt-dlp[default]" >/dev/null 2>&1 || true   # sites change often; keep yt-dlp fresh
fi

command -v ffmpeg >/dev/null 2>&1 || { apt-get update -qq && apt-get install -y -qq ffmpeg; }

[ -d bg/node_modules/mp4-muxer ] || (cd bg && npm install --silent --no-audit --no-fund)

echo "Stream Clipper ready: yt-dlp $(yt-dlp --version), $(ffmpeg -version | head -1 | cut -d' ' -f1-3)"
