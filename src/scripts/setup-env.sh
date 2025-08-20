#!/bin/bash
###
 # @Author: yzy
 # @Date: 2025-08-20 11:03:58
 # @LastEditors: yzy
 # @LastEditTime: 2025-08-20 11:04:05
### 

# 云锦轩环境设置脚本

echo "设置云锦轩服务器环境..."

# 检查Node.js版本
NODE_VERSION=$(node -v)
if [[ $NODE_VERSION != v18* ]]; then
    echo "错误: 需要 Node.js 18.x，当前版本: $NODE_VERSION"
    exit 1
fi

# 检查PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "错误: PostgreSQL 未安装"
    exit 1
fi

# 创建数据库
echo "创建数据库..."
sudo -u postgres psql -c "CREATE DATABASE cloudloom_db;"
sudo -u postgres psql -c "CREATE USER cloudloom_user WITH PASSWORD '${DB_PASSWORD}';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE cloudloom_db TO cloudloom_user;"

# 设置环境变量
echo "设置环境变量..."
cat > .env << EOL
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=cloudloom_user
DB_PASSWORD=${DB_PASSWORD}
DB_DATABASE=cloudloom_db
DB_SYNCHRONIZE=false
DB_LOGGING=true

# App
NODE_ENV=production
PORT=3001
CORS_ORIGINS=https://cloudloom.yzysong.com

# Email (可选)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
ADMIN_EMAIL=your_admin@email.com
EOL

echo "环境设置完成!"