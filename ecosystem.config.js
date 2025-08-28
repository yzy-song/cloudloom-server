/*
 * @Author: yzy
 * @Date: 2025-08-20 11:05:48
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-28 12:38:37
 */
module.exports = {
  apps: [{
    name: 'cloudloom-server',
    script: '/current/main.js',
    user: "cloudloom",
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
    },
    // ----------------------------

    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
  }],
};