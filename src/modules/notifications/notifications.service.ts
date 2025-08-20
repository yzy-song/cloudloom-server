import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

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
      secure: false,
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS'),
      },
    });
  }

  async sendBookingConfirmation(booking: any, product: any): Promise<void> {
    const subject = `云锦轩预约确认 - ${product.title}`;
    const html = `
      <h2>感谢您的预约！</h2>
      <p>您的汉服体验预约已成功提交，详细信息如下：</p>
      
      <h3>预约详情</h3>
      <ul>
        <li><strong>产品：</strong>${product.title}</li>
        <li><strong>尺寸：</strong>${booking.selectedSize}</li>
        <li><strong>日期：</strong>${booking.bookingDate}</li>
        <li><strong>时间：</strong>${booking.timeSlot}</li>
        <li><strong>总价：</strong>€${booking.totalPrice}</li>
      </ul>
      
      <h3>注意事项</h3>
      <ul>
        <li>请提前15分钟到达体验馆</li>
        <li>如需取消或改期，请提前24小时联系我们</li>
        <li>请妥善爱护汉服，如有损坏需照价赔偿</li>
      </ul>
      
      <p>如有任何疑问，请随时联系我们：</p>
      <p>电话: +353 874853709<br>
      邮箱: info@huashangjiuzhou.ie</p>
      
      <p>期待您的光临！</p>
      <p><em>云锦轩汉服体验馆团队</em></p>
    `;

    await this.sendEmail(booking.contactInfo, subject, html);
  }

  async sendNewInquiryNotification(inquiry: any): Promise<void> {
    const adminEmail = this.configService.get('ADMIN_EMAIL') || 'info@huashangjiuzhou.ie';
    const subject = `新的商业合作咨询 - ${inquiry.name}`;
    const html = `
      <h2>新的商业合作咨询</h2>
      
      <h3>咨询详情</h3>
      <ul>
        <li><strong>姓名：</strong>${inquiry.name}</li>
        <li><strong>联系方式：</strong>${inquiry.contact}</li>
        <li><strong>公司：</strong>${inquiry.company || '未提供'}</li>
        <li><strong>合作类型：</strong>${this.getCollaborationTypeLabel(inquiry.collaborationType)}</li>
      </ul>
      
      <h3>消息内容</h3>
      <p>${inquiry.message}</p>
      
      <p>请及时处理此咨询。</p>
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
        from: `"云锦轩汉服体验馆" <${this.configService.get('EMAIL_USER')}>`,
        to,
        subject,
        html,
      });

      this.logger.log(`邮件发送成功: ${subject} -> ${to}`);
    } catch (error) {
      this.logger.error(`邮件发送失败: ${error.message}`, error.stack);
      // 不抛出错误，避免影响主业务流程
    }
  }
}
