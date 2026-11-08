#!/usr/bin/env bash
set -eo pipefail

main_sha="$(gh api "repos/$GITHUB_REPOSITORY/git/ref/heads/main" --jq '.object.sha')"
if [ "$main_sha" != "$GITHUB_SHA" ]; then
  echo "::error::main has advanced; deploy its current revision instead."
  exit 1
fi
