/*
 * @Author: yzy
 * @Date: 2025-08-20 11:05:48
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-28 00:29:33
 */
module.exports = {
  apps: [{
    name: 'cloudloom-server',
    script: './current/main.js', // <-- 关键修改：PM2将通过这个路径来启动服务
    cwd: '/var/www/cloudloom-server', // 确保PM2的工作目录在项目根目录
    
    instances: 'max',
    exec_mode: 'cluster',

    // --- 推荐的加载 .env 方式 ---
    // 这个键是 PM2 专用的，用于加载环境变量文件
    env_file: '/var/www/cloudloom-server/.env',

    // --- 生产环境配置 ---
    // 这里只定义必要的环境变量，PM2 会自动与 env_file 中的变量合并
    env_production: {
      NODE_ENV: 'production',
    },
    // ----------------------------

    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
  }],
};