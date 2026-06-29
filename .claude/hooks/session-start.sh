#!/bin/bash
# SessionStart hook: ensure the graphify CLI is installed so the existing
# knowledge graph in graphify-out/ is queryable in fresh (ephemeral) sessions.
set -euo pipefail

# Only needed in remote (Claude Code on the web) sessions, where the container
# is reclaimed and rebuilt fresh each time. Skip locally.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Idempotent: nothing to do if the CLI is already on PATH.
if command -v graphify >/dev/null 2>&1; then
  exit 0
fi

# The PyPI distribution is named "graphifyy"; it provides the `graphify` binary.
python3 -m pip install graphifyy -q 2>/dev/null \
  || python3 -m pip install graphifyy -q --break-system-packages

# Confirm the binary is available; fail loudly if the install didn't expose it.
command -v graphify >/dev/null 2>&1
