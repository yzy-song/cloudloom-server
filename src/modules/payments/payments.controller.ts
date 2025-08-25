/*
 * @Author: yzy
 * @Date: 2025-08-25 01:28:02
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-25 02:04:46
 */
import { Controller, Post, Body, HttpCode, HttpStatus, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request, Response } from 'express';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: '创建支付' })
  @ApiResponse({
    status: 201,
    description: '支付创建成功',
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
  })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.createPayment(createPaymentDto);
  }

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
}
