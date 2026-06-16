# Deployment

This project deploys in two stages:

1. GitHub Actions `CI` builds the app on every push to `main`.
2. EC2 polls `main` once per minute and runs `scripts/deploy-ec2.sh` whenever a new commit is detected.

## Required GitHub Secrets

Add these repository secrets if you want the optional manual GitHub SSH deploy workflow:

- `EC2_HOST`: `65.2.7.159`
- `EC2_USER`: `ubuntu`
- `EC2_SSH_KEY`: contents of the EC2 private key PEM file

## Server scripts

- `scripts/deploy-ec2.sh`
  Pulls `main`, installs dependencies, runs Prisma migrations, builds the app, syncs the tracked Nginx config, reloads Nginx, and restarts PM2.

- `scripts/check-and-deploy.sh`
  Compares the local commit to `origin/main` and only runs deployment when GitHub has a newer commit.

- `scripts/install-auto-deploy-timer.sh`
  Installs the systemd service and timer that make EC2 auto-deploy from GitHub.

- `scripts/harden-ec2.sh`
  Enables `ufw`, installs and enables `fail2ban`, tightens SSH settings, protects `.env`, and removes the stray empty root-level SQLite file if present.

## Expected flow

1. Make changes locally.
2. Push to GitHub.
3. Wait for `CI` to pass.
4. The EC2 timer notices the new `main` commit and deploys it automatically, usually within a minute.

No production code edits should be made directly on the server outside emergency recovery.
