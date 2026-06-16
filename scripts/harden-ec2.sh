#!/usr/bin/env bash

set -Eeuo pipefail

APP_DIR="${APP_DIR:-/home/ubuntu/website}"

sudo apt-get update
sudo apt-get install -y fail2ban ufw

sudo tee /etc/ssh/sshd_config.d/99-anah-hardening.conf >/dev/null <<'EOF'
PasswordAuthentication no
PermitRootLogin no
MaxAuthTries 3
PubkeyAuthentication yes
X11Forwarding no
EOF

sudo sshd -t
sudo systemctl restart ssh

sudo tee /etc/fail2ban/jail.d/anah.local >/dev/null <<'EOF'
[sshd]
enabled = true
bantime = 1h
findtime = 10m
maxretry = 5
EOF

sudo systemctl enable --now fail2ban

sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

if [ -f "$APP_DIR/.env" ]; then
  chmod 600 "$APP_DIR/.env"
fi

if [ -f "$APP_DIR/anah.db" ] && [ ! -s "$APP_DIR/anah.db" ]; then
  rm -f "$APP_DIR/anah.db"
fi

sudo systemctl reload nginx
