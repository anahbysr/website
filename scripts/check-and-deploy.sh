#!/usr/bin/env bash

set -Eeuo pipefail

APP_DIR="${APP_DIR:-/home/ubuntu/website}"
BRANCH="${BRANCH:-main}"

cd "$APP_DIR"

current_commit="$(git rev-parse HEAD)"
remote_commit="$(git ls-remote origin "refs/heads/$BRANCH" | awk '{print $1}')"

if [ -z "$remote_commit" ]; then
  echo "Unable to resolve origin/$BRANCH"
  exit 1
fi

if [ "$current_commit" = "$remote_commit" ]; then
  echo "Already up to date at $current_commit"
  exit 0
fi

echo "New commit detected: $current_commit -> $remote_commit"
APP_DIR="$APP_DIR" BRANCH="$BRANCH" PM2_APP_NAME="${PM2_APP_NAME:-anah-web}" ./scripts/deploy-ec2.sh
