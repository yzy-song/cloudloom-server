// src/modules/notifications/notifications.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Booking } from '../../core/entities/booking.entity';
import { Product } from '../../core/entities/product.entity';
import { CollaborationApplication } from '../../core/entities/collaboration-application.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get('EMAIL_PORT'),
      secure: false, // 对于某些SMTP服务可能需要设置为true
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS'),
      },
    });
  }

  async sendBookingConfirmation(booking: Booking, product: Product): Promise<void> {
    const subject = `云锦轩预约确认 - ${product.title}`;
    const html = `
      <h2>感谢您的预约！</h2>
      <p>您的汉服体验预约已成功提交，详细信息如下：</p>
      
      <h3>预约详情</h3>
      <ul>
        <li><strong>产品：</strong>${product.title}</li>
        <li><strong>日期：</strong>${booking.bookingDate}</li>
        <li><strong>时间：</strong>${booking.bookingTime}</li>
        <li><strong>人数：</strong>€${booking.totalAmount}</li>
      </ul>
      
      <p>期待您的光临！</p>
      <p><em>云锦轩汉服体验馆团队</em></p>
    `;

    await this.sendEmail(booking.customerEmail, subject, html);
  }

  async sendNewCollaborationNotification(collaboration: CollaborationApplication): Promise<void> {
    const adminEmail = this.configService.get('ADMIN_EMAIL');
    if (!adminEmail) {
      this.logger.error('ADMIN_EMAIL not set in environment variables. Cannot send collaboration notification.');
      return;
    }

    const subject = `新的商业合作申请 - ${collaboration.name}`;
    const html = `
      <h2>新的商业合作申请</h2>
      
      <h3>申请详情</h3>
      <ul>
        <li><strong>姓名：</strong>${collaboration.name}</li>
        <li><strong>联系方式：</strong>${collaboration.phone}</li>
        <li><strong>公司：</strong>${collaboration.company || '未提供'}</li>
        <li><strong>合作类型：</strong>${collaboration.collaborationType}</li>
      </ul>
      
      <h3>消息内容</h3>
      <p>${collaboration.message}</p>
      
      <p>请及时处理此申请。</p>
    `;

    await this.sendEmail(adminEmail, subject, html);
  }

  private getCollaborationTypeLabel(type: number): string {
    const types = {
      1: '批发采购',
      2: '寄售合作',
      3: '联合活动',
    };
    return types[type] || `未知类型 (${type})`;
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('EMAIL_USER'),
        to,
        subject,
        html,
      });
      this.logger.log(`邮件发送成功: to=${to}, subject=${subject}`);
    } catch (error) {
      this.logger.error(`邮件发送失败: to=${to}, error=${error.message}`, error.stack);
      // 在生产环境中，可以考虑将失败的邮件记录下来或重试
    }
  }
}
