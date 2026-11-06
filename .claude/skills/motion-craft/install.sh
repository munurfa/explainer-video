#!/usr/bin/env bash
# Install or symlink motion-craft into agent skill directories
# Compatible with ZCode / Agent Skills (~/.agents/skills), Claude Code (~/.claude/skills), and Codex (~/.codex/skills)

set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="motion-craft"

targets=()
mode="copy"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --agents)      targets+=("$HOME/.agents/skills") ;;
    --claude)      targets+=("$HOME/.claude/skills") ;;
    --codex)       targets+=("$HOME/.codex/skills") ;;
    --all-agents)  targets+=("$HOME/.agents/skills" "$HOME/.claude/skills" "$HOME/.codex/skills") ;;
    --symlink)     mode="symlink" ;;
    *)             echo "Usage: ./install.sh [--agents|--claude|--codex|--all-agents] [--symlink]"; exit 1 ;;
  esac
  shift
done

[[ ${#targets[@]} -eq 0 ]] && targets=("$HOME/.agents/skills" "$HOME/.claude/skills")

for target_root in "${targets[@]}"; do
  mkdir -p "$target_root"
  dest="$target_root/$SKILL_NAME"
  rm -rf "$dest"
  if [[ "$mode" == "symlink" ]]; then
    ln -s "$SKILL_DIR" "$dest"
    echo "[install.sh] Symlinked $SKILL_NAME -> $dest"
  else
    cp -r "$SKILL_DIR" "$dest"
    echo "[install.sh] Installed $SKILL_NAME -> $dest"
  fi
done
