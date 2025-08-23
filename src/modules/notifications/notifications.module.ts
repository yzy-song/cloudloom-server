/*
 * @Author: yzy
 * @Date: 2025-08-23 04:43:07
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-23 04:43:41
 */
import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
