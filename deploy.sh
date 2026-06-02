#!/usr/bin/env bash
# One-command deploy to Hostinger (no GitHub Actions, no fail2ban headaches).
#
# Usage (run in Git Bash, or: `bash deploy.sh`):
#   bash deploy.sh          # deploy BOTH api + web
#   bash deploy.sh web      # only rebuild + upload the frontend  (fast, ~30s)
#   bash deploy.sh api      # only upload Laravel + composer + migrate
#
# Requires: the SSH key at ~/.ssh/hostinger_deploy (already created), Node/npm,
# and Git Bash's tar + ssh (already present on this machine).
set -euo pipefail

# ============================ CONFIG ============================
# Change these if the domain / hosting account / paths change.
SSH_HOST=46.202.142.44
SSH_PORT=65002
SSH_USER=u984572075
SSH_KEY="$HOME/.ssh/hostinger_deploy"
API_DIR=/home/u984572075/laravel-api
WEB_DIR=/home/u984572075/domains/plum-mouse-764078.hostingersite.com/public_html
API_URL=https://plum-mouse-764078.hostingersite.com/backend
SITE_URL=https://plum-mouse-764078.hostingersite.com
REVERB_HOST=plum-mouse-764078.hostingersite.com
# ===============================================================

cd "$(dirname "$0")"
SSH="ssh -i $SSH_KEY -p $SSH_PORT -o StrictHostKeyChecking=no -o BatchMode=yes $SSH_USER@$SSH_HOST"

deploy_api() {
  echo "==> API: packaging + uploading + composer + migrate ..."
  tar czf - -C api \
    --exclude='./vendor' --exclude='./node_modules' --exclude='./.env' \
    --exclude='./.git' --exclude='./storage/logs' \
    --exclude='./database/database.sqlite' --exclude='./bootstrap/cache' . \
  | $SSH "mkdir -p '$API_DIR' && tar xzf - -C '$API_DIR' \
      && ln -sfn '$API_DIR/public' '$WEB_DIR/backend' \
      && cd '$API_DIR' \
      && composer install --no-dev --optimize-autoloader --no-interaction \
      && php artisan migrate --force \
      && php artisan config:cache"
  # Note: no `php artisan storage:link` — Hostinger disables PHP exec(), and
  # this app references images by external URL, so public/storage isn't needed.
  echo "    API done."
}

deploy_web() {
  echo "==> WEB: building static export + uploading ..."
  (
    cd web
    # Production env so the static bundle points at the live API.
    cat > .env.production.local <<EOF
NEXT_PUBLIC_API_URL=$API_URL
NEXT_PUBLIC_REVERB_APP_KEY=auction-key
NEXT_PUBLIC_REVERB_HOST=$REVERB_HOST
NEXT_PUBLIC_REVERB_PORT=443
NEXT_PUBLIC_REVERB_SCHEME=https
EOF
    NEXT_TELEMETRY_DISABLED=1 npm run build
    cp deploy/public_html.htaccess out/.htaccess
    rm -f .env.production.local
    # Upload the built site. The `backend` symlink (API) is left untouched.
    tar czf - -C out . | $SSH "tar xzf - -C '$WEB_DIR'"
  )
  echo "    WEB done."
}

case "${1:-all}" in
  api) deploy_api ;;
  web) deploy_web ;;
  all) deploy_api; deploy_web ;;
  *) echo "Usage: bash deploy.sh [all|api|web]"; exit 1 ;;
esac

echo ""
echo "✅ Deployed."
echo "   Site: $SITE_URL"
echo "   API:  $API_URL/api/auctions"
