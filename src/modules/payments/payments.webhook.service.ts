/*
 * @Author: yzy
 * @Date: 2025-08-25 02:40:31
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-25 02:40:41
 */
import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
// 假设有订单服务
// import { OrderService } from '../../orders/order.service';

@Injectable()
export class PaymentsWebhookService {
  private readonly logger = new Logger(PaymentsWebhookService.name);

  // 构造函数注入订单服务（如有）
  // constructor(private readonly orderService: OrderService) {}

  async handleEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        // 支付成功
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        this.logger.log('PaymentIntent succeeded:', paymentIntent);

        // 假设 metadata 里有订单号
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId) {
          // await this.orderService.updateStatus(orderId, 'paid');
          this.logger.log(`订单 ${orderId} 已标记为已支付`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        // 支付失败
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        this.logger.warn('PaymentIntent failed:', paymentIntent);

        const orderId = paymentIntent.metadata?.orderId;
        if (orderId) {
          // await this.orderService.updateStatus(orderId, 'failed');
          this.logger.warn(`订单 ${orderId} 标记为支付失败`);
        }
        // 可通知用户
        break;
      }

      case 'payment_intent.canceled': {
        // 支付被取消
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        this.logger.warn('PaymentIntent canceled:', paymentIntent);

        const orderId = paymentIntent.metadata?.orderId;
        if (orderId) {
          // await this.orderService.updateStatus(orderId, 'canceled');
          this.logger.warn(`订单 ${orderId} 标记为已取消`);
        }
        break;
      }

      case 'charge.succeeded': {
        // 直接 charge 成功（如一次性扣款）
        const charge = event.data.object as Stripe.Charge;
        this.logger.log('Charge succeeded:', charge);

        const orderId = charge.metadata?.orderId;
        if (orderId) {
          // await this.orderService.updateStatus(orderId, 'paid');
          this.logger.log(`订单 ${orderId} 通过 charge 成功支付`);
        }
        break;
      }

      case 'charge.refunded': {
        // 退款成功
        const charge = event.data.object as Stripe.Charge;
        this.logger.log('Charge refunded:', charge);

        const orderId = charge.metadata?.orderId;
        if (orderId) {
          // await this.orderService.updateStatus(orderId, 'refunded');
          this.logger.log(`订单 ${orderId} 已退款`);
        }
        break;
      }

      case 'customer.subscription.created': {
        // 订阅创建
        const subscription = event.data.object as Stripe.Subscription;
        this.logger.log('Subscription created:', subscription);

        const userId = subscription.metadata?.userId;
        if (userId) {
          // await this.userService.updateSubscription(userId, subscription.id, 'active');
          this.logger.log(`用户 ${userId} 订阅已创建`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        // 订阅更新
        const subscription = event.data.object as Stripe.Subscription;
        this.logger.log('Subscription updated:', subscription);

        const userId = subscription.metadata?.userId;
        if (userId) {
          // await this.userService.updateSubscription(userId, subscription.id, subscription.status);
          this.logger.log(`用户 ${userId} 订阅状态更新为 ${subscription.status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        // 订阅取消
        const subscription = event.data.object as Stripe.Subscription;
        this.logger.warn('Subscription deleted:', subscription);

        const userId = subscription.metadata?.userId;
        if (userId) {
          // await this.userService.updateSubscription(userId, subscription.id, 'canceled');
          this.logger.warn(`用户 ${userId} 订阅已取消`);
        }
        break;
      }

      default:
        this.logger.debug(`Unhandled event type: ${event.type}`);
        break;
    }
  }
}
