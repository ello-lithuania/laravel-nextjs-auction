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
# DOMAIN is the only thing that changes when the site's domain changes; the
# server folder lives under ~/domains/<DOMAIN>/ on Hostinger. If your folder
# under ~/domains/ is still named after the old (plum-mouse) address, set
# API_DIR/WEB_DIR explicitly instead of deriving them from $DOMAIN.
DOMAIN=dekaukciona.lt
SSH_HOST=46.202.142.44
SSH_PORT=65002
SSH_USER=u984572075
SSH_KEY="$HOME/.ssh/hostinger_deploy"
API_DIR=/home/u984572075/domains/$DOMAIN/laravel-api
WEB_DIR=/home/u984572075/domains/$DOMAIN/public_html
API_URL=https://$DOMAIN/backend
SITE_URL=https://$DOMAIN
REVERB_HOST=$DOMAIN
# ===============================================================

cd "$(dirname "$0")"
SSH="ssh -i $SSH_KEY -p $SSH_PORT -o StrictHostKeyChecking=no -o BatchMode=yes $SSH_USER@$SSH_HOST"

deploy_api() {
  echo "==> API: packaging + uploading + composer + migrate ..."
  tar czf - -C api \
    --exclude='./vendor' --exclude='./node_modules' --exclude='./.env' \
    --exclude='./.git' --exclude='./storage/logs' \
    --exclude='./database/database.sqlite' --exclude='./bootstrap/cache' \
    --exclude='./public/uploads' . \
  | $SSH "mkdir -p '$API_DIR' && tar xzf - -C '$API_DIR' \
      && ln -sfn '$API_DIR/public' '$WEB_DIR/backend' \
      && cd '$API_DIR' \
      && composer install --no-dev --optimize-autoloader --no-interaction \
      && php artisan migrate --force \
      && php artisan db:seed --class=PostSeeder --force \
      && php artisan config:cache"
  # Naudotojų įkeltos nuotraukos rašomos į public/uploads (be storage:link) ir
  # serviuojamos per /backend/uploads — tinka Hostinger, kur symlink ribotas.
  echo "    API done."
}

deploy_migrate() {
  echo "==> Running migrations + content seed on server ..."
  $SSH "cd '$API_DIR' \
      && php artisan migrate --force \
      && php artisan db:seed --class=PostSeeder --force \
      && php artisan config:cache"
  echo "    migrate done."
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
    # Upload the built site. First delete the old hashed assets so stale tabs
    # can't load a previous build's JS (old chunk -> 404 -> Next reloads to the
    # fresh build). Also drop the FTP-Deploy-Action sync-state file: an SSH
    # deploy makes it stale, and the Action would then try to delete folders we
    # already removed (FTP 550). Clearing it forces the next CI run to do a clean
    # full upload. The `backend` symlink (API) and .htaccess are left untouched.
    tar czf - -C out . | $SSH "rm -rf '$WEB_DIR/_next' '$WEB_DIR/.ftp-deploy-sync-state.json' && tar xzf - -C '$WEB_DIR'"
  )
  echo "    WEB done."
}

case "${1:-all}" in
  api) deploy_api ;;
  web) deploy_web ;;
  migrate) deploy_migrate ;;
  all) deploy_api; deploy_web ;;
  *) echo "Usage: bash deploy.sh [all|api|web|migrate]"; exit 1 ;;
esac

echo ""
echo "✅ Deployed."
echo "   Site: $SITE_URL"
echo "   API:  $API_URL/api/auctions"
