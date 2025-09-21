/*
 * @Author: yzy
 * @Date: 2025-08-25 02:40:31
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-25 02:40:41
 */
import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { BookingsService } from '../bookings/bookings.service';
// 假设有订单服务

@Injectable()
export class PaymentsWebhookService {
  private readonly logger = new Logger(PaymentsWebhookService.name);

  // 构造函数注入订单服务（如有）
  constructor(private readonly bookingsService: BookingsService) {}

  async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        this.handleCheckoutSessionCompleted(session);
        break;
      case 'payment_intent.succeeded': {
        break;
      }

      case 'payment_intent.payment_failed': {
        break;
      }

      case 'payment_intent.canceled': {
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

      default:
        this.logger.debug(`Unhandled event type: ${event.type}`);
        break;
    }
  }

  /**
   * 当Stripe确认支付会话完成时调用
   * 这是更新数据库、发送邮件等核心业务逻辑的地方
   */
  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      // 这是一个严重错误，需要记录下来排查
      this.logger.error(`严重错误: checkout.session.completed 事件的元数据中缺少 bookingId! Session ID: ${session.id}`);
      return;
    }

    this.logger.log(`✅ Checkout 会话成功，关联的订单ID: ${bookingId}!`);

    // 2. 更新预约状态为已支付
    try {
      // 你可以自定义 BookingsService 的 updatePaidStatus 方法
      // await this.bookingsService.updatePaidStatus(bookingId);

      // 或直接更新数据库
      // await this.bookingsService.markAsPaid(bookingId, session.payment_intent);

      this.logger.log(`预约 ${bookingId} 已标记为已支付`);
    } catch (error) {
      this.logger.error(`更新预约支付状态失败: ${error?.message}`, error?.stack);
    }

    // 3. 可选：发送通知、邮件等
  }
}
