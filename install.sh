#!/usr/bin/env bash
# Install dev-crew agents, skills and commands into Claude Code.
#   ./install.sh            -> user-level   (~/.claude)
#   ./install.sh --project  -> project-level (./.claude in the current directory)
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${1:-}" == "--project" ]]; then
  DEST="$(pwd)/.claude"
else
  DEST="${HOME}/.claude"
fi

echo "Installing dev-crew into ${DEST}"
mkdir -p "${DEST}/agents" "${DEST}/skills" "${DEST}/commands" "${DEST}/templates/dev-crew"

cp "${SRC}"/agents/*.md "${DEST}/agents/"
cp "${SRC}"/commands/*.md "${DEST}/commands/"
for skill in "${SRC}"/skills/*/; do
  name="$(basename "${skill}")"
  mkdir -p "${DEST}/skills/${name}"
  cp -R "${skill}". "${DEST}/skills/${name}/"
done
cp "${SRC}/templates/CLAUDE.md" "${DEST}/templates/dev-crew/CLAUDE.md"

echo "Done: $(ls "${SRC}"/agents/*.md | wc -l | tr -d ' ') agents, $(ls -d "${SRC}"/skills/*/ | wc -l | tr -d ' ') skills, $(ls "${SRC}"/commands/*.md | wc -l | tr -d ' ') commands."
echo "Restart Claude Code, then try: /onboard"
