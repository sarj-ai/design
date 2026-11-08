#!/usr/bin/env bash
set -eo pipefail

npx wrangler versions upload 2>&1 | tee upload.log
# Wrangler prints "Version Preview URL: https://<prefix>-design-lab.<subdomain>.workers.dev"
url="$(grep -oE 'https://[a-z0-9-]+\.[a-z0-9-]+\.workers\.dev' upload.log | head -1)"
if [ -z "$url" ]; then
  echo "::error::No preview URL in the wrangler output. Version preview URLs may be disabled for this Worker."
  exit 1
fi
echo "url=$url" >>"$GITHUB_OUTPUT"
