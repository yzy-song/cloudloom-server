#!/bin/bash
# 任何命令失败时立即退出，确保部署流程的完整性
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # 无色

# =========================================================================
# NestJS 后端自动化部署脚本（带数据库连接检查与回滚功能）
# =========================================================================

PROJECT_NAME="cloudloom-server"
DEPLOY_ROOT="/var/www/${PROJECT_NAME}"
RELEASES_DIR="${DEPLOY_ROOT}/releases"
CURRENT_SYMLINK="${DEPLOY_ROOT}/current"
ENV_FILE="${DEPLOY_ROOT}/.env"
ECOSYSTEM_CONFIG_FILE="${DEPLOY_ROOT}/ecosystem.config.js"
BACKUPS_DIR="${DEPLOY_ROOT}/backups"
LOGS_DIR="${DEPLOY_ROOT}/logs"
APP_USER="cloudloom"
APP_GROUP="cloudloom"

# 超时设置
DB_CHECK_TIMEOUT=10
DEPLOY_TIMEOUT=300  # 整个部署过程的最大超时时间(秒)
MAX_RETRIES=3       # 最大重试次数

echo -e "${BLUE}==================================================================${NC}"
echo -e "${GREEN}Starting deployment for ${PROJECT_NAME} at $(date)${NC}"
echo -e "${BLUE}==================================================================${NC}"

# 获取当前Git提交哈希作为部署标识
DEPLOY_ID=$(git rev-parse --short HEAD)
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

# 修复 Git 仓库所有权
sudo chown -R $(whoami):$(whoami) /var/www/cloudloom-server/repo.git || true
git config --global --add safe.directory /var/www/cloudloom-server/repo.git || true

# 创建必要的目录结构
mkdir -p "${RELEASES_DIR}" "${BACKUPS_DIR}" "${LOGS_DIR}" || {
    echo -e "${RED}Error: Failed to create required directories. Aborting deployment.${NC}"
    exit 1
}

# 记录部署开始时间
DEPLOY_START_TIME=$(date +%s)

# 1. 创建新的发布目录
RELEASE_NAME="${TIMESTAMP}-${DEPLOY_ID}"
RELEASE_PATH="${RELEASES_DIR}/${RELEASE_NAME}"

echo -e "${YELLOW}Creating new release directory: ${RELEASE_PATH}${NC}"
mkdir -p "${RELEASE_PATH}"

# 2. 复制代码到新版本目录
echo -e "${YELLOW}Archiving latest code into new release directory: ${RELEASE_PATH}${NC}"
git archive --format=tar main | tar -xf - -C "${RELEASE_PATH}"

# 3. 进入发布目录
cd "${RELEASE_PATH}" || { 
    echo -e "${RED}Error: Failed to change directory to ${RELEASE_PATH}. Aborting.${NC}"
    exit 1
}

# 4. 复制环境文件
if [ -f "${ENV_FILE}" ]; then
    cp "${ENV_FILE}" .env
    echo -e "${GREEN}.env file copied to ${RELEASE_PATH}/.env.${NC}"
    
    # 加载环境变量用于后续操作
    source .env
    
    # 验证必要的环境变量
    validate_environment
else
    echo -e "${RED}Warning: .env file not found at ${ENV_FILE}, some checks will be skipped${NC}"
fi

# 5. 数据库连接检查
check_db_connection() {
    echo -e "${YELLOW}Checking database connection...${NC}"
    
    # 数据库连接验证脚本
    local DB_CHECK_SCRIPT="
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
config();

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    extra: { 
        connectTimeout: ${DB_CHECK_TIMEOUT}000,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    }
});

AppDataSource.initialize()
    .then(() => {
        console.log('Database connection successful');
        process.exit(0);
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });
"

    timeout ${DB_CHECK_TIMEOUT} node -e "${DB_CHECK_SCRIPT}" && {
        echo -e "${GREEN}✓ Database connection verified${NC}"
        return 0
    } || {
        echo -e "${RED}✗ Database connection failed! Check your DB config in .env${NC}"
        return 1
    }
}

# 仅在 .env 存在时执行检查
[ -f "${ENV_FILE}" ] && check_db_connection || {
    echo -e "${YELLOW}⚠ Proceeding without database connection verification${NC}"
}

# 6. 安装依赖
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install --production || {
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    log_error "npm_install_failed"
    rollback_deployment
    exit 1
}

# 7. 构建项目
echo -e "${YELLOW}Building NestJS project...${NC}"
npx nest build || {
    echo -e "${RED}✗ Failed to build project${NC}"
    log_error "build_failed"
    rollback_deployment
    exit 1
}

# 8. 更新符号链接
echo -e "${YELLOW}Updating 'current' symlink...${NC}"
ln -nfs "${RELEASE_PATH}/dist" "${CURRENT_SYMLINK}" || {
    echo -e "${RED}✗ Failed to update symlink${NC}"
    log_error "symlink_failed"
    rollback_deployment
    exit 1
}

# 9. 复制 PM2 配置
echo -e "${YELLOW}Updating PM2 configuration...${NC}"
[ -f "./ecosystem.config.js" ] && cp "./ecosystem.config.js" "${ECOSYSTEM_CONFIG_FILE}"

# 10. 修复权限
echo -e "${YELLOW}Setting file permissions...${NC}"
chown -R ${APP_USER}:${APP_GROUP} "${DEPLOY_ROOT}"
chmod -R u=rwX,g=rX,o=rX "${DEPLOY_ROOT}"

# 11. 重启应用前备份
backup_current_version() {
    echo -e "${YELLOW}Creating backup of current version...${NC}"
    if [ -d "${CURRENT_SYMLINK}" ]; then
        BACKUP_NAME="${TIMESTAMP}-before-${DEPLOY_ID}"
        tar -czf "${BACKUPS_DIR}/${BACKUP_NAME}.tar.gz" -C "${CURRENT_SYMLINK%/*}" . || {
            echo -e "${YELLOW}✗ Warning: Backup creation failed but continuing deployment${NC}"
        }
    fi
}

# 12. 重启服务
echo -e "${YELLOW}Restarting application via PM2...${NC}"
pm2 restart "${ECOSYSTEM_CONFIG_FILE}" --env production --wait-wait-for-app 30 || {
    echo -e "${YELLOW}Starting new instance...${NC}"
    pm2 start "${ECOSYSTEM_CONFIG_FILE}" --env production --wait-wait-for-app 30 || {
        echo -e "${RED}✗ Critical failure: Could not start application${NC}"
        log_error "pm2_restart_failed"
        rollback_deployment
        exit 1
    }
}

# 13. 部署后健康检查
wait_for_app_health() {
    echo -e "${YELLOW}Waiting for application to become healthy...${NC}"
    local max_attempts=$((DEPLOY_TIMEOUT/5))
    local attempt=0
    local healthy=false
    
    while [ $attempt -lt $max_attempts ] && [ "$healthy" != "true" ]; do
        ((attempt++))
        
        # 尝试检查应用健康状态
        if curl -sf http://localhost:3000/health >/dev/null 2>&1; then
            healthy=true
            echo -e "${GREEN}✓ Application is healthy after $attempt attempts${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}Attempt $attempt/$max_attempts: Waiting for application to be ready...${NC}"
        sleep 5
    done
    
    echo -e "${RED}✗ Application did not become healthy after $max_attempts attempts${NC}"
    log_error "health_check_failed"
    rollback_deployment
    exit 1
}

# 14. 清理旧版本
echo -e "${YELLOW}Cleaning old releases...${NC}"
ls -t "${RELEASES_DIR}" | tail -n +6 | xargs -I {} rm -rf "${RELEASES_DIR}/{}"

# 15. 记录部署完成信息
echo -e "${BLUE}==================================================================${NC}"
echo -e "${GREEN}Deployment successful! New version is live.${NC}"
echo -e "${GREEN}Deploy ID: ${DEPLOY_ID}${NC}"
echo -e "${GREEN}Released at: $(date)${NC}"
echo -e "${GREEN}Deploy duration: $(( $(date +%s) - DEPLOY_START_TIME )) seconds${NC}"
echo -e "${BLUE}==================================================================${NC}"

# 部署后健康检查
wait_for_app_health

# 日志记录函数
log_deployment() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Deployment successful: $1" >> "${LOGS_DIR}/deployment.log"
}

# 错误日志记录函数
log_error() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - DEPLOYMENT FAILED: $1" >> "${LOGS_DIR}/deployment.log"
}

# 环境变量验证函数
validate_environment() {
    required_env_vars="DB_HOST DB_PORT DB_USERNAME"
    missing_env_vars=""
    
    for var in $required_env_vars; do
        if [ -z "${!var}" ]; then
            missing_env_vars="$missing_env_vars $var"
        fi
    done
    
    if [ ! -z "$missing_env_vars" ]; then
        echo -e "${RED}Error: Required environment variables not set: $missing_env_vars${NC}"
        log_error "missing_env_vars"
        rollback_deployment
        exit 1
    fi
}

# 回滚机制
rollback_deployment() {
    echo -e "${RED}Initiating automatic rollback process...${NC}"
    
    # 查找上一个成功的部署版本
    LAST_SUCCESSFUL=$(find "${RELEASES_DIR}" -maxdepth 1 -type d -printf '%T@ %p\n' | sort -nr | head -n 1 | awk '{print $2}')
    
    if [ -z "$LAST_SUCCESSFUL" ]; then
        echo -e "${RED}✗ Cannot find any successful previous deployment for rollback${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}Rolling back to version: ${LAST_SUCCESSFUL}${NC}"
    
    # 备份当前失败的版本
    backup_current_version
    
    # 切换回上一个版本
    ln -nfs "${LAST_SUCCESSFUL}/dist" "${CURRENT_SYMLINK}" || {
        echo -e "${RED}✗ Failed to switch back to previous version${NC}"
        exit 1
    }
    
    # 重启应用
    echo -e "${YELLOW}Restarting application after rollback...${NC}"
    pm2 restart "${ECOSYSTEM_CONFIG_FILE}" --env production || {
        echo -e "${RED}✗ Failed to restart application after rollback${NC}"
        exit 1
    }
    
    echo -e "${GREEN}✓ Rollback completed successfully${NC}"
    echo -e "${YELLOW}Run 'git log --oneline ${RELEASE_ID}' to investigate the issue${NC}"
    exit 1
}