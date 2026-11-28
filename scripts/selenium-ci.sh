#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

case "${1:-}" in
  "") ;;
  --visible) export RESUMEAI_SELENIUM_VISIBLE=1 ;;
  *) echo "Usage: bash scripts/selenium-ci.sh [--visible]" >&2; exit 2 ;;
esac

project="resumeai-selenium-$(openssl rand -hex 6)"
export JWT_ACCESS_SECRET="$(openssl rand -hex 32)"
export AI_SERVICE_KEY="$(openssl rand -hex 32)"
# Use the offline test stack even if the developer's environment has provider keys.
export GROQ_API_KEY="" GEMINI_API_KEY="" GOOGLE_CLIENT_ID="" GOOGLE_CLIENT_SECRET="" GOOGLE_REDIRECT_URI=""
python_bin="${SELENIUM_PYTHON:-python3}"
compose=(docker compose --env-file /dev/null -p "$project" -f docker-compose.yml -f docker-compose.selenium.yml)
trap '"${compose[@]}" down --volumes' EXIT

"${compose[@]}" up -d --build --wait --wait-timeout 120
"${compose[@]}" exec -T -e NODE_ENV=test backend node dist/seed/seed.js
export RESUMEAI_BASE_URL="http://$("${compose[@]}" port frontend 80)"
export RESUMEAI_DEMO_EMAIL=alice@test.com RESUMEAI_DEMO_PASSWORD='Password123!'
if [[ "${1:-}" == "--visible" ]]; then
  echo "Opening HireSmart AI in Chrome at $RESUMEAI_BASE_URL"
  "$python_bin" -m unittest discover -v -s frontend/tests -p selenium_workflows.py -k test_candidate_resume_to_application
else
  "$python_bin" -m unittest discover -v -s frontend/tests -p 'selenium_*.py'
fi
