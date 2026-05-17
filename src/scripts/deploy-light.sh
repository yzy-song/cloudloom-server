#!/bin/bash
# =========================================================================
# 轻量级部署脚本 — 仅 npm ci + migration + PM2 restart
# 不执行 nest build（构建由 GitHub Actions 完成）
# 用法: 在本地构建并打包后传到服务器，然后运行此脚本
#
#   本地: npm ci && npm run build
#   本地: tar -czf deploy.tar.gz dist/ package.json package-lock.json ecosystem.config.js tsconfig.json tsconfig.build.json src/data-source.ts src/migrations/
#   本地: scp deploy.tar.gz ubuntu@138.2.42.101:/var/www/cloudloom-server/
#   服务器: bash /var/www/cloudloom-server/deploy-light.sh
# =========================================================================
set -e

ROOT=/var/www/cloudloom-server
PACKAGE="${1:-${ROOT}/deploy.tar.gz}"

if [ ! -f "$PACKAGE" ]; then
  echo "ERROR: deploy package not found: $PACKAGE"
  exit 1
fi

cd "$ROOT"

TS=$(date +%Y%m%d%H%M%S)
RELEASE="releases/${TS}"
mkdir -p "$RELEASE"

echo "[1/5] Extracting $PACKAGE → $RELEASE"
tar -xzf "$PACKAGE" -C "$RELEASE"
rm -f "$PACKAGE"

echo "[2/5] Linking .env"
cp .env "$RELEASE/.env"

cd "$RELEASE"

echo "[3/5] npm ci"
npm ci --prefer-offline --no-audit --no-fund

echo "[4/5] Running migrations"
npx ts-node --transpile-only ./node_modules/typeorm/cli.js migration:run --dataSource src/data-source.ts || \
  echo "WARN: migration failed, continuing..."

echo "[5/5] Switching symlink + PM2 reload"
ln -nfs "$ROOT/$RELEASE/dist" "$ROOT/current"
cp ecosystem.config.js "$ROOT/ecosystem.config.js"

cd "$ROOT"
sudo -u cloudloom pm2 startOrReload ecosystem.config.js --env production --cwd "$ROOT" || \
  sudo -u cloudloom pm2 start ecosystem.config.js --env production --cwd "$ROOT"
sudo -u cloudloom pm2 save

# Keep last 5
cd "$ROOT/releases" && ls -t | tail -n +6 | xargs -I {} rm -rf {}

sleep 3
curl -sf http://localhost:3000/api/health && echo "HEALTH: OK" || echo "HEALTH: FAIL"
echo ">>> DEPLOYED: ${TS} <<<"
