#!/usr/bin/env bash
set -eo pipefail

body="**Preview:** $URL

Built from \`${SHA:0:7}\`. This version is uploaded but takes no production traffic — main is still serving whatever was last deployed."
# --edit-last keeps one comment per PR instead of one per push; the
# fallback covers the first run, when there is nothing to edit.
gh pr comment "$PR" --edit-last --body "$body" || gh pr comment "$PR" --body "$body"
