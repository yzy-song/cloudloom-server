/*
 * @Author: yzy
 * @Date: 2025-08-25 02:01:14
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-25 02:03:26
 */
import { Controller, Post, Req, Res, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import type { Request, Response } from 'express';
import { PaymentsWebhookService } from './payments.webhook.service';

@ApiTags('支付')
@Controller('payments/webhook')
export class PaymentsWebhookController {
  constructor(
    private configService: ConfigService,
    private paymentsWebhookService: PaymentsWebhookService
  ) {}

  @Post()
  @ApiOperation({ summary: '处理Stripe支付Webhook回调' })
  @ApiHeader({ name: 'stripe-signature', description: 'Stripe Webhook 签名', required: true })
  @ApiResponse({ status: 200, description: 'Webhook处理成功' })
  @ApiResponse({ status: 400, description: 'Webhook请求错误' })
  async handleWebhook(@Req() req: Request, @Res() res: Response, @Headers('stripe-signature') signature: string) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-07-30.basil',
    });
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined in environment variables');
    }
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    await this.paymentsWebhookService.handleEvent(event);

    res.json({ received: true });
  }
}
