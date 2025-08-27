/*
 * @Author: yzy
 * @Date: 2025-08-20 11:05:48
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-27 21:47:30
 */
module.exports = {
  apps: [{
    name: 'cloudloom-server',
    script: './current/main.js', // <-- 关键修改：PM2将通过这个路径来启动服务
    cwd: '/var/www/cloudloom-server', // 确保PM2的工作目录在项目根目录
    
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
  }],
};