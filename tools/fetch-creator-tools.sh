#!/usr/bin/env bash
# Shallow-clone the creator tools that are apps or starter kits (not Claude Code
# plugins) into vendor/ so Claude can read and run them. vendor/ is gitignored.
# Usage: bash tools/fetch-creator-tools.sh [name ...]   (no args = all)
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p vendor

declare -A REPOS=(
  [mg-styles-15]=Vincentwei1021/mg-styles-15
  [ClaudeAnimationBase]=JohnHeibel/ClaudeAnimationBase
  [openshorts]=mutonby/openshorts
  [supoclip]=FujiwaraChoki/supoclip
  [cutawan]=JeremySNR/cutawan
  [clips-studio]=ColinGPT9/clips-studio
  [gtavi-claudecode]=Bodila51/gtavi-claudecode
  [lemo-opuscar]=lemomo-ai/lemo-opuscar
)

names=("$@")
[ ${#names[@]} -eq 0 ] && names=("${!REPOS[@]}")

for n in "${names[@]}"; do
  repo="${REPOS[$n]:-}"
  if [ -z "$repo" ]; then echo "unknown tool: $n (known: ${!REPOS[*]})" >&2; exit 1; fi
  if [ -d "vendor/$n/.git" ]; then
    echo "updating $n"; git -C "vendor/$n" pull -q --ff-only
  else
    echo "cloning $n"; git clone -q --depth 1 "https://github.com/$repo.git" "vendor/$n"
  fi
done
