#!/usr/bin/env bash

set -Eeuo pipefail

APP_DIR="${APP_DIR:-/home/ubuntu/website}"
PM2_APP_NAME="${PM2_APP_NAME:-anah-web}"
BRANCH="${BRANCH:-main}"

cd "$APP_DIR"

echo "Deploying branch $BRANCH in $APP_DIR"

git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

npm ci
npx prisma migrate deploy
npm run build

if [ -f "deploy/nginx/anah-web.conf" ]; then
  sudo install -m 644 deploy/nginx/anah-web.conf /etc/nginx/sites-available/anah-web
  sudo ln -sfn /etc/nginx/sites-available/anah-web /etc/nginx/sites-enabled/anah-web
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo nginx -t
  sudo systemctl reload nginx
fi

if pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_APP_NAME" --update-env
else
  PORT="${PORT:-3000}" pm2 start npm --name "$PM2_APP_NAME" -- start -- --hostname 127.0.0.1 --port "${PORT:-3000}"
fi

pm2 save
