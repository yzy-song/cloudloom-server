/*
 * @Author: yzy
 * @Date: 2025-08-25 01:28:02
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-25 02:04:46
 */
import { Controller, Post, Body, HttpCode, HttpStatus, Req, Res, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '处理Stripe支付回调' })
  @ApiResponse({
    status: 200,
    description: 'Webhook处理成功',
  })
  @ApiResponse({
    status: 400,
    description: 'Webhook请求错误',
  })
  handleWebhook(@Req() request: Request, @Res() response: Response) {
    const event = request.body; // Assuming Stripe sends the event in the request body
    return this.paymentsService.handleWebhook(event);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-payment-intent')
  async createPaymentIntent(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.createPaymentIntent(createPaymentDto);
  }
  /**
   * NEW ENDPOINT for Stripe Checkout
   * This endpoint creates a checkout session and returns the session ID
   * to the client.
   */
  @UseGuards(JwtAuthGuard)
  @Post('create-checkout-session')
  async createCheckoutSession(@Body() body: any) {
    // In a real application, you'd get the items and booking info from your database
    // based on what the user has in their cart.
    const { items, bookingId } = body;
    return this.paymentsService.createCheckoutSession(items, bookingId);
  }
}
