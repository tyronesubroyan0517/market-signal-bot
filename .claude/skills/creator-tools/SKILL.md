---
name: creator-tools
description: Index of the third-party video and clipping tools added to this repo (gtavi-claudecode, Lemo-Opuscar, MG Styles 15, Claude Animation Base, OpenShorts, SupoClip, Cutawan, Clips Kitty). Use when the user asks for clips, shorts, a code-made film or motion piece, a cartoon, or names one of these tools, to pick the right one and get it ready.
---

# Creator tools

Full details, licences and requirements: `docs/creator-tools.md`.

## Pick the tool

| User wants | Use |
|---|---|
| Clips from a stream/VOD link, done end to end here | the repo's own `clip-stream` skill (no keys) |
| GTA 6 campaigns, trends, hooks, rule checks, multilingual clips | `gtavi-claudecode` plugin if installed; otherwise `bash tools/fetch-creator-tools.sh gtavi-claudecode` and read `vendor/gtavi-claudecode/skills/<name>/SKILL.md` |
| A short film in one of 99 styles | `lemo-opuscar` plugin, or fetch `lemo-opuscar` and read `plugin/skills/lemo-opuscar/SKILL.md` (styles are **non-commercial**) |
| A 10-second motion-design piece from a prompt | fetch `mg-styles-15`, read its `README.md` and the matching `prompts/` file |
| A hand-painted cartoon of the Clawd character | fetch `ClaudeAnimationBase`, read its `ANIMATION_GUIDE.md`, write a scene in `src/scenes/`, run `node render.mjs --clip` |
| Hosted clipping + auto-publishing | `openshorts` skill (needs `OPENSHORTS_API_KEY`) |
| Self-hosted AI clip scoring | SupoClip (Docker; **non-commercial licence**) |
| Desktop clipping app | Cutawan or Clips Kitty: they run on the user's own computer, not in a cloud session |

## Rules

- Fetch only what the task needs; `vendor/` is gitignored, never commit it.
- Before clips go to a paid campaign, check the tool's licence in `docs/creator-tools.md`
  (SupoClip and Lemo-Opuscar styles forbid commercial use) and the campaign's own rules.
- Never ask the user to paste API keys into chat; they set them as environment secrets.
