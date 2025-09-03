#!/bin/bash
###
 # @Author: yzy
 # @Date: 2025-08-29 22:53:34
 # @LastEditors: yzy
 # @LastEditTime: 2025-08-30 09:49:05
###
# 任何命令失败时立即退出
set -e

# =========================================================================
# 手动回滚到指定版本
# 使用方法: /var/www/cloudloom-server/rollback.sh 20240830120000
# =========================================================================

# 颜色定义
RED='\\033\[0;31m'
GREEN='\\033\[0;32m'
YELLOW='\\033\[1;33m'
BLUE='\\033\[0;34m'
NC='\\033\[0m' # 无色

# 部署配置
DEPLOY_ROOT="/var/www/cloudloom-server"
RELEASES_DIR="$DEPLOY_ROOT/releases"
CURRENT_SYMLINK="$DEPLOY_ROOT/current"
ECOSYSTEM_CONFIG_FILE="$DEPLOY_ROOT/ecosystem.config.js"
BACKUPS_DIR="$DEPLOY_ROOT/backups"
LOG_FILE="$DEPLOY_ROOT/rollback.log"  # 修改日志文件为rollback.log

# 时间戳
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

# 初始化日志
log() {
    echo "\[$TIMESTAMP\] $1" | tee -a "$LOG_FILE"
}

# 验证参数
if [ $# -ne 1 ]; then
    echo -e "${RED}Usage: $0 [version_timestamp]${NC}"
    echo -e "Example: $0 20240830120000${NC}"
    exit 1
fi

TARGET_VERSION=$1

# 查找目标版本目录
TARGET_PATH="$RELEASES_DIR/$TARGET_VERSION"
if [ ! -d "$TARGET_PATH" ]; then
    echo -e "${RED}Error: Version $TARGET_VERSION not found${NC}"
    echo -e "${BLUE}Available versions: $(find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%P\\n' | sort | tr '\\n' ' ')${NC}"  # 使用 find 和 sort 列出可用版本
    exit 1
fi

# 执行回滚
perform_rollback() {
    log "${YELLOW}Rolling back to version: $TARGET_VERSION${NC}"
    
    # 切换符号链接
    ln -nfs "$TARGET_PATH/dist" "$CURRENT_SYMLINK" || {
        log "${RED}✗ Failed to update symlink${NC}"
        exit 1
    }
    
    # 重启服务
    log "${YELLOW}Restarting application...${NC}"
    pm2 startOrReload "${ECOSYSTEM_CONFIG_FILE}" --env production --cwd "${DEPLOY_ROOT}" || {
        log "${RED}✗ Failed to startOrReload PM2${NC}"
        exit 1
    }
}

# 清理旧备份
cleanup_backups() {
    log "${YELLOW}Cleaning old backups...${NC}"
    find "$BACKUPS_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%P\\n' | sort | head -n -5 | xargs -I {} rm -rf "$BACKUPS_DIR/{}" || {
        log "${RED}✗ Failed to clean old backups${NC}"
    }
    log "${GREEN}✓ Old backups cleaned successfully${NC}"
}

# 执行回滚流程
log "${BLUE}==================================================================${NC}"
log "${GREEN}Starting rollback process at $(date)${NC}"
log "${BLUE}==================================================================${NC}"

# 执行回滚
perform_rollback

# 清理旧备份
cleanup_backups

log "${BLUE}==================================================================${NC}"
log "${GREEN}Rollback completed successfully.${NC}"
log "${GREEN}New version: $TARGET_VERSION${NC}"
log "${BLUE}==================================================================${NC}"
