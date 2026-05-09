#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="cloudloom-server"
DEPLOY_ROOT="/var/www/${PROJECT_NAME}"
ECOSYSTEM_CONFIG_FILE="${DEPLOY_ROOT}/ecosystem.config.js"
APP_USER="cloudloom"
APP_HOME="/home/${APP_USER}"

usage() {
  cat <<EOF
Usage: $0 <command>
Commands:
  start          Start or reload the app with PM2 and persist the process list
  stop           Stop the app managed by PM2
  restart        Restart the app, or start it if it is not running
  status         Show PM2 status for the app
  list           Show PM2 process list
  save           Persist the current PM2 process list
  startup        Generate system startup script for PM2 (one-time setup)
  help           Show this help message
EOF
}

require_ecosystem() {
  if [ ! -f "${ECOSYSTEM_CONFIG_FILE}" ]; then
    echo "Error: PM2 ecosystem file not found at ${ECOSYSTEM_CONFIG_FILE}" >&2
    exit 1
  fi
}

pm2_cmd() {
  if ! command -v pm2 >/dev/null 2>&1; then
    echo "Error: pm2 is not installed or not in PATH." >&2
    exit 1
  fi
  pm2 "$@"
}

cmd_start() {
  require_ecosystem
  echo "Starting or reloading ${PROJECT_NAME} via PM2..."
  pm2_cmd startOrReload "${ECOSYSTEM_CONFIG_FILE}" --env production --cwd "${DEPLOY_ROOT}"
  echo "Saving PM2 process list..."
  pm2_cmd save
  echo "Done. Use '$0 status' to verify."
}

cmd_stop() {
  echo "Stopping ${PROJECT_NAME} via PM2..."
  pm2_cmd stop "${PROJECT_NAME}" || true
}

cmd_restart() {
  echo "Restarting ${PROJECT_NAME} via PM2..."
  if pm2_cmd restart "${PROJECT_NAME}"; then
    echo "Restarted ${PROJECT_NAME}."
  else
    echo "App is not running, starting it now..."
    cmd_start
  fi
  pm2_cmd save
}

cmd_status() {
  pm2_cmd status "${PROJECT_NAME}" || true
}

cmd_list() {
  pm2_cmd ls
}

cmd_save() {
  echo "Saving PM2 process list..."
  pm2_cmd save
}

cmd_startup() {
  echo "Generating PM2 startup script for systemd as user ${APP_USER}..."
  pm2_cmd startup systemd -u "${APP_USER}" --hp "${APP_HOME}"
  echo "Run 'pm2 save' after starting your app to persist the process list." 
}

if [ $# -lt 1 ]; then
  usage
  exit 1
fi

case "$1" in
  start)
    cmd_start
    ;;
  stop)
    cmd_stop
    ;;
  restart)
    cmd_restart
    ;;
  status)
    cmd_status
    ;;
  list)
    cmd_list
    ;;
  save)
    cmd_save
    ;;
  startup)
    cmd_startup
    ;;
  help|-h|--help)
    usage
    ;;
  *)
    echo "Unknown command: $1" >&2
    usage
    exit 1
    ;;
esac
