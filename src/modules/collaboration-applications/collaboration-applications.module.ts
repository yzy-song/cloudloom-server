/*
 * @Author: yzy
 * @Date: 2025-08-20 10:46:49
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-23 04:35:36
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollaborationApplicationsService } from './collaboration-applications.service';
import { CollaborationApplicationsController } from './collaboration-applications.controller';
import { CollaborationApplication } from '../../core/entities/collaboration-application.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([CollaborationApplication]), NotificationsModule],
  controllers: [CollaborationApplicationsController],
  providers: [CollaborationApplicationsService],
  exports: [CollaborationApplicationsService],
})
export class CollaborationApplicationsModule {}
