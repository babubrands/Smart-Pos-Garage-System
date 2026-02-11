#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8080}"

if command -v php >/dev/null 2>&1; then
  echo "Starting with PHP on http://localhost:${PORT}"
  exec php -S 0.0.0.0:"${PORT}" serve.php
fi

if command -v javac >/dev/null 2>&1 && command -v java >/dev/null 2>&1; then
  echo "Starting with Java on http://localhost:${PORT}"
  javac StaticServer.java
  exec java StaticServer "${PORT}"
fi

echo "Error: Neither PHP nor Java found in PATH."
echo "Install one of them, then run: ./start-pos.sh"
exit 1
