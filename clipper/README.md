# Stream Clipper

Turns a Twitch, Kick or YouTube VOD link into vertical split-screen clips: the stream on one half,
an original animated "gameplay" loop on the other, and bold word-by-word captions on the seam.
Claude picks the moments.

## Use it from your phone

1. Open the Claude app → **Code**, pick this repository (`market-signal-bot`), and start a session.
2. Paste the link, for example: `clip this https://www.twitch.tv/videos/2932003293`
3. Claude runs the `clip-stream` skill (`.claude/skills/clip-stream/SKILL.md`) and sends the MP4s back in the chat.

The cloud session needs unrestricted network access (set in the environment settings) to reach Twitch, Kick and YouTube.

## What works where

| Source | Cloud session (phone) | Your own computer |
|---|---|---|
| Twitch VODs | Yes | Yes |
| Kick VODs | Yes | Yes |
| YouTube | Usually blocked ("confirm you're not a bot") | Yes |
| Live streams | Only after they end (VOD) | Only after they end |

## Commands

```bash
bash clipper/setup.sh
python3 clipper/clip.py prepare "<link>" --job /tmp/clips/name        # audio + draft transcript + loud spikes
# Claude reads /tmp/clips/name/transcript.txt and writes moments.json
python3 clipper/clip.py render --job /tmp/clips/name --moments /tmp/clips/name/moments.json --layout top --bg runner
```

Outputs: `/tmp/clips/name/out/*.mp4` (1080×1920, H.264 + AAC) and `/tmp/clips/name/clips.zip`.

Caption font: Anton (SIL Open Font License, see `fonts/OFL.txt`).
