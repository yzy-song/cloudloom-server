#!/bin/bash
# =========================================================================
# 轻量级部署脚本 — 仅 npm ci + migration + PM2 restart
# 不执行 nest build（构建由 GitHub Actions 完成）
#
# 本地手动流程:
#   npm ci && npm run build
#   tar -czf deploy.tar.gz dist/ package.json package-lock.json ecosystem.config.js tsconfig.json tsconfig.build.json src/data-source.ts src/migrations/
#   scp deploy.tar.gz ubuntu@138.2.42.101:/var/www/cloudloom-server/
#   ssh yzy 'cd /var/www/cloudloom-server && bash src/scripts/deploy-light.sh'
# =========================================================================
set -e

ROOT=/var/www/cloudloom-server
PACKAGE="${1:-${ROOT}/deploy.tar.gz}"
RELEASE_DIR="${ROOT}/releases/$(date +%Y%m%d%H%M%S)"

if [ ! -f "$PACKAGE" ]; then
  echo "ERROR: deploy package not found: $PACKAGE"
  exit 1
fi

sudo mkdir -p "$RELEASE_DIR"
sudo chown "$(whoami):$(whoami)" "$RELEASE_DIR"

echo "[1/5] Extracting → ${RELEASE_DIR}"
tar xzf "$PACKAGE" -C "$RELEASE_DIR"
rm -f "$PACKAGE"

echo "[2/5] Linking .env"
cp "$ROOT/.env" "$RELEASE_DIR/.env"

cd "$RELEASE_DIR"

echo "[3/5] npm ci"
npm ci --prefer-offline --no-audit --no-fund

echo "[4/5] Running migrations"
npx ts-node --transpile-only ./node_modules/typeorm/cli.js migration:run --dataSource src/data-source.ts || \
  echo "WARN: migration failed, continuing..."

echo "[5/5] Switching symlink + PM2 reload"
cp ecosystem.config.js "$ROOT/ecosystem.config.js"
sudo ln -nfs "$RELEASE_DIR/dist" "$ROOT/current"

cd "$ROOT"
sudo -u cloudloom pm2 startOrReload ecosystem.config.js --env production --cwd "$ROOT" || \
  sudo -u cloudloom pm2 start ecosystem.config.js --env production --cwd "$ROOT"
sudo -u cloudloom pm2 save

# Keep last 5
ls -dt "$ROOT/releases/"*/ 2>/dev/null | tail -n +6 | sudo xargs rm -rf 2>/dev/null || true

sleep 3
curl -sf http://localhost:3000/api/health && echo "HEALTH: OK" || echo "HEALTH: FAIL"
echo ">>> DEPLOYED <<<"
