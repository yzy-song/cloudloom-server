#!/bin/bash
###
# @Author: yzy
# @Desc: 云锦轩生产环境自动化配置脚本
# @Warning: 执行前需确保有sudo权限和网络连接
###

set -e # 遇到错误立即退出

echo "🛠️ 开始设置云锦轩生产环境..."
echo "--------------------------------"

# ======================
# 1. 环境预检
# ======================
echo "🔍 运行环境检查..."

# Node.js 检查
NODE_VERSION=$(node -v)
if [[ $NODE_VERSION != v18* ]]; then
    echo "❌ 错误: 需要 Node.js 18.x，当前版本: $NODE_VERSION"
    echo "👉 建议: 使用 nvm 安装: nvm install 18 && nvm use 18"
    exit 1
else
    echo "✅ Node.js 版本检查通过 ($NODE_VERSION)"
fi

# PostgreSQL 检查
if ! command -v psql &> /dev/null; then
    echo "❌ 错误: PostgreSQL 未安装"
    echo "👉 建议: sudo apt-get install postgresql-14"
    exit 1
else
    echo "✅ PostgreSQL 已安装"
fi

# ======================
# 2. 数据库配置
# ======================
echo "💾 配置数据库..."

# 安全提示
read -p "⚠️ 即将修改数据库配置，是否继续？(y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "🛑 操作已取消"
    exit 0
fi

# 获取密码（安全方式）
read -s -p "🔑 输入数据库密码: " DB_PASSWORD
echo

# 执行SQL命令
sudo -u postgres psql <<EOF
-- 创建数据库
CREATE DATABASE cloudloom_db;
-- 创建专属生产用户
CREATE ROLE cloudloom WITH LOGIN PASSWORD '${DB_PASSWORD}';
-- 设置权限
GRANT ALL PRIVILEGES ON DATABASE cloudloom_db TO cloudloom;
-- 优化配置（生产环境推荐）
ALTER DATABASE cloudloom_db SET lock_timeout = '10s';
ALTER DATABASE cloudloom_db SET statement_timeout = '30s';
EOF

echo "✅ 数据库配置完成"

# ======================
# 3. 生成环境变量文件
# ======================
echo "📝 生成.env文件..."

# 安全备份旧配置
if [ -f ".env" ]; then
    BACKUP_NAME=".env.backup_$(date +%s)"
    mv .env $BACKUP_NAME
    echo "🔐 已备份旧配置到 $BACKUP_NAME"
fi

# 生成生产环境配置
cat > .env <<EOL
# ======================
# 云锦轩生产环境配置
# 生成时间: $(date)
# ======================

# 数据库
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=cloudloom_prod
DB_PASSWORD=${DB_PASSWORD}
DB_DATABASE=cloudloom_prod_db
DB_SYNCHRONIZE=false
DB_LOGGING=false  # 生产环境关闭SQL日志

# 应用
NODE_ENV=production
PORT=3000
CORS_ORIGINS=https://cloudloom.yzysong.com

# 安全
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
REFRESH_TOKEN_SECRET=$(openssl rand -hex 32)
TOKEN_EXPIRES_IN=15m

# 监控
PROMETHEUS_METRICS=true
EOL

# 设置文件权限
chmod 600 .env
echo "✅ .env文件已生成（权限设置为600）"

# ======================
# 4. 后续指引
# ======================
echo "🎉 环境配置完成！"
echo "👉 下一步操作建议:"
echo "1. 检查 .env 文件配置"
echo "2. 运行: npm install --production"
echo "3. 初始化数据库: npm run migration:run"
echo "4. 启动应用: pm2 start npm --name \"cloudloom\" -- run start:prod"
echo "--------------------------------"