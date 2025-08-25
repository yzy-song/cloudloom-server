/*
 * @Author: yzy
 * @Date: 2025-08-25 01:28:02
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-25 02:06:52
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Stripe } from 'stripe';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-07-30.basil',
    });
  }

  async createPayment(createPaymentDto: CreatePaymentDto) {
    const { amount, currency, paymentMethodId } = createPaymentDto;

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Number(amount),
      currency,
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });

    // 推荐只返回关键字段
    return {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
  }

  async handleWebhook(event: Stripe.Event) {
    // Handle the event based on its type
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        // Update your order status in your database
        break;
      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object;
        // Handle the failed payment
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }
}
