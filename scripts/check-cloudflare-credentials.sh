#!/usr/bin/env bash
set -eo pipefail

[ -n "$TOKEN" ] || {
  echo "::error::CLOUDFLARE_API_TOKEN is empty"
  exit 1
}
[ -n "$ACCOUNT" ] || {
  echo "::error::CLOUDFLARE_ACCOUNT_ID is empty"
  exit 1
}
# Lengths only, never the values. A real token is 40 characters and an
# account id is 32 hex, so this distinguishes "wrong thing pasted"
# from "wrong scope" without putting a secret in the log.
echo "token: ${#TOKEN} chars, account: ${#ACCOUNT} chars"
