#!/usr/bin/env bash

set -Eeuo pipefail

APP_DIR="${APP_DIR:-/home/ubuntu/website}"

cd "$APP_DIR"

sudo install -m 644 deploy/systemd/anah-autodeploy.service /etc/systemd/system/anah-autodeploy.service
sudo install -m 644 deploy/systemd/anah-autodeploy.timer /etc/systemd/system/anah-autodeploy.timer
sudo systemctl daemon-reload
sudo systemctl enable --now anah-autodeploy.timer
sudo systemctl start anah-autodeploy.service
