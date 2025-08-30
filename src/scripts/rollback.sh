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
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 无色

# 部署配置
DEPLOY_ROOT="/var/www/cloudloom-server"
RELEASES_DIR="$DEPLOY_ROOT/releases"
CURRENT_SYMLINK="$DEPLOY_ROOT/current"
ECOSYSTEM_CONFIG_FILE="$DEPLOY_ROOT/ecosystem.config.js"
BACKUPS_DIR="$DEPLOY_ROOT/backups"
LOG_FILE="$DEPLOY_ROOT/deploy.log"

# 时间戳
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

# 初始化日志
log() {
    echo "[$TIMESTAMP] $1" | tee -a "$LOG_FILE"
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
    echo -e "Available versions: $(ls -t $RELEASES_DIR | tr '\n' ' ')" | tee -a "$LOG_FILE"
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
    # 修复：添加 --cwd 参数
    pm2 startOrReload "${ECOSYSTEM_CONFIG_FILE}" --env production --cwd "${DEPLOY_ROOT}" || {
        log "${RED}✗ Failed to startOrReload PM2${NC}"
        exit 1
    }
}

# 清理旧备份
cleanup_backups() {
    log "${YELLOW}Cleaning old backups...${NC}"
    # 修复：移除对不存在的.tar.gz备份的清理
    # 仅清理旧的 release 目录
    ls -t "${RELEASES_DIR}" | tail -n +6 | xargs -I {} rm -rf "${RELEASES_DIR}/{}"
}

# 主流程
main() {
    log "Starting rollback process"
    perform_rollback
    # 你可能不需要在回滚时清理旧版本，但为了完整性，这里保留了
    # 如果你觉得不需要，可以删除 `cleanup_backups` 这行
    cleanup_backups
    log "Rollback completed successfully"
    echo -e "${GREEN}✓ Rollback to $TARGET_VERSION succeeded!${NC}"
}

# 执行主流程
main