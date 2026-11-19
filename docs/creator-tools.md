# Creator tools

Eight third-party tools for clips, shorts and code-made video, wired into this repo.
Reviewed 2026-11-19: no hooks, no auto-started MCP servers, and no unexpected network calls
in the plugin code.

| Tool | Repo | What it is | How it's added | Licence | Needs |
|---|---|---|---|---|---|
| gtavi-claudecode | [Bodila51/gtavi-claudecode](https://github.com/Bodila51/gtavi-claudecode) | 15-skill GTA 6 clipping desk: campaigns, trends, moments, cuts, hooks, rule checks, 5 languages | Claude Code plugin (install below) | MIT | Python, ffmpeg; optional Twitch keys |
| Lemo-Opuscar | [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) | 99 code-rendered film styles | Claude Code plugin (install below) | MIT code, **CC-BY-NC-4.0 styles** | Node, Python, ffmpeg |
| MG Styles 15 | [Vincentwei1021/mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15) | 15 motion-design styles with prompts and source | `tools/fetch-creator-tools.sh` | MIT | Node, Chrome, ffmpeg |
| Claude Animation Base | [JohnHeibel/ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) | p5.js character (31 emotions) and renderer | `tools/fetch-creator-tools.sh` | MIT | Node, Chrome, ffmpeg (GPU helps) |
| OpenShorts | [mutonby/openshorts](https://github.com/mutonby/openshorts) | Long video → 9:16 clips, captions, publishing | Skill vendored in `.claude/skills/openshorts/` (MIT, commit 7e3468c); app via fetch script | MIT | Hosted: `OPENSHORTS_API_KEY`. Self-host: Docker, 8 GB RAM, Gemini key |
| SupoClip | [FujiwaraChoki/supoclip](https://github.com/FujiwaraChoki/supoclip) | AI clip scoring, animated captions | `tools/fetch-creator-tools.sh` | **SupoClip Noncommercial Source License** (not AGPL as some posts say) | Docker, AssemblyAI key, LLM key |
| Cutawan | [JeremySNR/cutawan](https://github.com/JeremySNR/cutawan) | Electron desktop clipping app | `tools/fetch-creator-tools.sh` | MIT | Windows / Apple Silicon Mac / Linux desktop, AI API key |
| Clips Kitty (clips-studio) | [ColinGPT9/clips-studio](https://github.com/ColinGPT9/clips-studio) | Fully local clipping app + MCP server | `tools/fetch-creator-tools.sh` | AGPL-3.0 | Windows 10/11, 16 GB RAM, NVIDIA GPU |

## Installing the two plugins

Run these in Claude Code (they are not enabled automatically):

```
/plugin marketplace add Bodila51/gtavi-claudecode
/plugin install gtavi-claudecode@gtavi-claudecode
/plugin marketplace add lemomo-ai/lemo-opuscar
/plugin install lemo-opuscar@lemolab
```

## Fetching the rest

```bash
bash tools/fetch-creator-tools.sh                 # all
bash tools/fetch-creator-tools.sh mg-styles-15    # one
```

## Before you take money for clips

- Licences: SupoClip and Lemo-Opuscar styles do not allow commercial use. The others do.
- Campaign rules: most paid campaigns require original edits and forbid reposting
  unmodified footage; some forbid AI voiceovers. The gtavi `rule-check` skill helps.
- Payouts depend on the campaign (e.g. Clip Tech pays Net 30 after a campaign ends).
  Treat "$15k/month while you sleep" claims as marketing.
