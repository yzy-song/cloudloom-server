/*
 * @Author: yzy
 * @Date: 2025-08-20 11:05:48
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-20 11:06:24
 */
module.exports = {
  apps: [{
    name: 'cloudloom-server',
    script: 'dist/main.js',
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