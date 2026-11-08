#!/usr/bin/env bash
set -eo pipefail

code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "$URL" || echo 000)"
case "$code" in
  2*)
    echo "::error::$URL answered $code to an anonymous request -- the Access gate is off and the site is public."
    exit 1
    ;;
  3* | 401 | 403)
    echo "$URL -> $code, gated as expected."
    ;;
  *)
    echo "::warning::$URL -> $code. Not gated, not reachable either; worth a look, but not a reason to fail a deploy that uploaded fine."
    ;;
esac
