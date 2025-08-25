/*
 * @Author: yzy
 * @Date: 2025-08-25 02:23:26
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-25 02:41:45
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsWebhookController } from './payments.webhook.controller';
import { PaymentsWebhookService } from './payments.webhook.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [PaymentsController, PaymentsWebhookController],
  providers: [PaymentsService, PaymentsWebhookService],
  exports: [PaymentsService, PaymentsWebhookService],
})
export class PaymentsModule {}
