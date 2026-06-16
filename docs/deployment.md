# Deployment

This project deploys in two stages:

1. GitHub Actions `CI` builds the app on every push to `main`.
2. GitHub Actions `Deploy` runs after `CI` succeeds and SSHes into EC2 to run `scripts/deploy-ec2.sh`.

## Required GitHub Secrets

Add these repository secrets before enabling auto-deploy:

- `EC2_HOST`: `65.2.7.159`
- `EC2_USER`: `ubuntu`
- `EC2_SSH_KEY`: contents of the EC2 private key PEM file

## Server scripts

- `scripts/deploy-ec2.sh`
  Pulls `main`, installs dependencies, runs Prisma migrations, builds the app, syncs the tracked Nginx config, reloads Nginx, and restarts PM2.

- `scripts/harden-ec2.sh`
  Enables `ufw`, installs and enables `fail2ban`, tightens SSH settings, protects `.env`, and removes the stray empty root-level SQLite file if present.

## Expected flow

1. Make changes locally.
2. Push to GitHub.
3. Wait for `CI` to pass.
4. `Deploy` runs automatically and updates EC2.

No production code edits should be made directly on the server outside emergency recovery.
