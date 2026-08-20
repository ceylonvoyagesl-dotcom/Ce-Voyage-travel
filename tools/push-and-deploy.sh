#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Ce Voyage — push-and-deploy.sh
#
# Stages every change in the working tree, commits it with a timestamped
# message (or one you pass in), and pushes the current branch to origin.
#
# GitHub Pages is configured to build from `main`, so once this branch is
# merged into `main` via a Pull Request the live site at
#   https://ceylonvoyagesl-dotcom.github.io/Ce-Voyage-travel/
# refreshes automatically within 1–2 minutes.
#
# Usage:
#   bash tools/push-and-deploy.sh                 # auto commit message
#   bash tools/push-and-deploy.sh "Fix guide typo" # custom commit message
# ---------------------------------------------------------------------------

set -euo pipefail

# Move to repo root regardless of where the script is called from.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
MSG="${1:-Update Ce Voyage site — $(date '+%Y-%m-%d %H:%M:%S %Z')}"

echo "▶ Repository : $REPO_ROOT"
echo "▶ Branch     : $BRANCH"
echo "▶ Commit msg : $MSG"
echo

echo "▶ git status (before):"
git status --short
echo

echo "▶ Staging all changes…"
git add -A

if git diff --cached --quiet; then
  echo "✓ Nothing to commit — working tree clean."
else
  echo "▶ Creating commit…"
  git commit -m "$MSG"
fi

echo
echo "▶ Pushing branch '$BRANCH' to origin…"
git push -u origin "$BRANCH"

echo
echo "✅ Done."
echo "   • Branch pushed: $BRANCH"
if [ "$BRANCH" = "main" ]; then
  echo "   • GitHub Pages will redeploy in 1–2 minutes."
  echo "   • Live: https://ceylonvoyagesl-dotcom.github.io/Ce-Voyage-travel/"
else
  echo "   • Open a Pull Request into 'main' to publish to the live site:"
  echo "     gh pr create --base main --head \"$BRANCH\" --fill"
fi
