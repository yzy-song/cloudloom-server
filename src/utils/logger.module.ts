/*
 * @Author: yzy
 * @Date: 2025-08-23 23:20:43
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-23 23:27:45
 */
import { Module, Global } from '@nestjs/common';
import { AppLogger } from './logger';

@Global()
@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggerModule {}
