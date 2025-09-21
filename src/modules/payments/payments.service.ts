/*
 * @Author: yzy
 * @Date: 2025-08-25 01:28:02
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-26 02:09:02
 */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

  async createPaymentIntent(createPaymentDto: CreatePaymentDto): Promise<{ clientSecret: string }> {
    try {
      const { amount, currency, description } = createPaymentDto;
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        description,
      });
      if (!paymentIntent.client_secret) {
        throw new InternalServerErrorException('PaymentIntent client_secret is null.');
      }
      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new InternalServerErrorException('Failed to create payment intent.');
    }
  }

  /**
   * NEW METHOD for Stripe Checkout
   * Creates a Stripe Checkout Session and returns its ID.
   * @param items - The items in the cart
   * @param bookingId - The id of the booking
   */
  async createCheckoutSession(items: { name: string; amount: number; quantity: number }[], bookingId: number): Promise<{ code: number; message: string; data: { sessionId: string } }> {
    const host = process.env.FRONTEND_URL || 'https://cloudloom.yzysong.com';

    const line_items = items.map(item => {
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
          },
          unit_amount: item.amount * 100, // amount in cents
        },
        quantity: item.quantity,
      };
    });

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/payment-success?bookingId=${bookingId}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
        metadata: {
          bookingId: bookingId,
        },
      });
      return {
        code: 0,
        message: 'Checkout session created successfully',
        data: {
          sessionId: session.id,
        },
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new InternalServerErrorException('Failed to create checkout session.');
    }
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
