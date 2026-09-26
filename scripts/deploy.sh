#!/bin/bash
# Run this ON the EC2 app server (SSH in first) to deploy the latest
# `main` branch: pulls code, installs deps, runs DB migrations, builds
# the frontend, and (re)starts the backend under pm2 behind nginx.
set -euxo pipefail

APP_DIR="/opt/hello_world"
cd "$APP_DIR"

git pull origin main

# --- Backend ---
cd "$APP_DIR/backend"
npm ci
npm run db:migrate
npm run build

# --- Frontend ---
cd "$APP_DIR/frontend"
npm ci
npm run build

# --- Process manager ---
cd "$APP_DIR/backend"
pm2 startOrRestart ecosystem.config.js
pm2 save

sudo systemctl reload nginx

echo "Deploy complete."
