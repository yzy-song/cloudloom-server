import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { AppLogger } from '../../utils/logger';
import { CreateBookingDto, UpdateBookingDto } from './dto/create-booking.dto';
import { BookingQueryDto } from './dto/booking-query.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Booking } from '../../core/entities/booking.entity';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext(BookingsController.name);
  }

  // 创建预约
  @Post()
  @ApiOperation({ summary: '创建新预约' })
  @ApiResponse({
    status: 201,
    description: '预约创建成功',
    type: Booking,
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
  })
  @ApiResponse({
    status: 404,
    description: '产品未找到',
  })
  @ApiResponse({
    status: 409,
    description: '库存不足或时间段冲突',
  })
  async create(@Body() createBookingDto: CreateBookingDto) {
    this.logger.log('POST /bookings 创建预约', { createBookingDto });
    return await this.bookingsService.create(createBookingDto);
  }

  // 取消预约（软删除/状态变更）
  @Patch(':id/cancel')
  async cancel(@Param('id') id: string) {
    this.logger.log(`PATCH /bookings/${id}/cancel 取消预约`);
    const booking = await this.bookingsService.cancel(id);
    return { data: booking, message: '预约已取消' };
  }

  // 获取预约列表（支持高级筛选）
  @Get()
  @ApiOperation({ summary: '获取预约列表（支持高级筛选）' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'] })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'customerName', required: false, type: String })
  @ApiQuery({ name: 'customerEmail', required: false, type: String })
  @ApiQuery({ name: 'bookingType', required: false, enum: ['standard', 'time_slot_only'] })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({
    status: 200,
    description: '返回预约列表',
    type: [Booking],
  })
  async findAll(@Query() query: BookingQueryDto) {
    this.logger.log('GET /bookings 查询预约列表', query);
    const result = await this.bookingsService.findAll(query);
    return { ...result, message: '预约列表获取成功' };
  }

  // 高级搜索预约（可合并到findAll，也可保留）
  @Get('search')
  @ApiOperation({ summary: '高级搜索预约' })
  @ApiResponse({
    status: 200,
    description: '返回搜索结果',
    type: [Booking],
  })
  async search(@Query() query: BookingQueryDto) {
    this.logger.log('GET /bookings/search 高级搜索预约', query);
    const result = await this.bookingsService.searchBookings(query);
    return { ...result, message: '预约搜索成功' };
  }

  // 获取可用时间段
  @Get(':productId/available-slots/:date')
  @ApiOperation({ summary: '获取可用时间段' })
  @ApiParam({ name: 'productId', description: '产品ID' })
  @ApiParam({ name: 'date', description: '日期 (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: '返回可用时间段列表',
    type: [String],
  })
  @ApiResponse({
    status: 404,
    description: '产品未找到',
  })
  async getAvailableTimeSlots(@Param('productId', ParseIntPipe) productId: number, @Param('date') date: string) {
    this.logger.log(`GET /bookings/${productId}/available-slots/${date} 获取可用时间段`);
    const slots = await this.bookingsService.getAvailableTimeSlots(productId, date);
    return { data: slots, message: '可用时间段获取成功' };
  }

  // 获取某天的所有预约
  @Get('date/:date')
  @ApiOperation({ summary: '获取某天的所有预约' })
  @ApiParam({ name: 'date', description: '日期 (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: '返回当天的预约列表',
    type: [Booking],
  })
  async getDailyBookings(@Param('date') date: string) {
    this.logger.log(`GET /bookings/date/${date} 获取某天的所有预约`);
    const bookings = await this.bookingsService.getDailyBookings(date);
    return { data: bookings, message: '当天预约获取成功' };
  }

  // 获取某产品某天的所有预约
  @Get('product/:productId/date/:date')
  @ApiOperation({ summary: '获取某产品某天的所有预约' })
  @ApiParam({ name: 'productId', description: '产品ID' })
  @ApiParam({ name: 'date', description: '日期 (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: '返回该产品当天的预约列表',
    type: [Booking],
  })
  async getProductDailyBookings(@Param('productId', ParseIntPipe) productId: number, @Param('date') date: string) {
    this.logger.log(`GET /bookings/product/${productId}/date/${date} 获取某产品某天的所有预约`);
    const bookings = await this.bookingsService.getProductDailyBookings(productId, date);
    return { data: bookings, message: '该产品当天预约获取成功' };
  }

  // 获取预约统计
  @Get('stats')
  @ApiOperation({ summary: '获取预约统计' })
  @ApiResponse({
    status: 200,
    description: '返回预约统计数据',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        pending: { type: 'number' },
        confirmed: { type: 'number' },
        completed: { type: 'number' },
        cancelled: { type: 'number' },
      },
    },
  })
  async getBookingStats() {
    this.logger.log('GET /bookings/stats 获取预约统计');
    const stats = await this.bookingsService.getBookingStats();
    return { data: stats, message: '预约统计获取成功' };
  }

  // 获取预约详情
  @Get(':bookingNumber')
  @ApiOperation({ summary: '根据ID获取预约详情' })
  @ApiParam({ name: 'bookingNumber', description: '预约ID' })
  @ApiResponse({
    status: 200,
    description: '返回预约详情',
    type: Booking,
  })
  @ApiResponse({
    status: 404,
    description: '预约未找到',
  })
  async getBookingDetail(@Param('bookingNumber') bookingNumber: string) {
    this.logger.log(`GET /bookings/${bookingNumber} 获取预约详情`);
    const booking = await this.bookingsService.findByBookingNumber(bookingNumber);
    return { data: booking, message: '预约详情获取成功' };
  }

  // 更新预约信息
  @Patch(':bookingNumber')
  @ApiOperation({ summary: '更新预约信息' })
  @ApiParam({ name: 'bookingNumber', description: '预约ID' })
  @ApiResponse({
    status: 200,
    description: '预约更新成功',
    type: Booking,
  })
  @ApiResponse({
    status: 404,
    description: '预约未找到',
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
  })
  async update(@Param('bookingNumber') bookingNumber: string, @Body() updateBookingDto: UpdateBookingDto) {
    this.logger.log(`PATCH /bookings/${bookingNumber} 更新预约`, { updateBookingDto });
    const booking = await this.bookingsService.update(bookingNumber, updateBookingDto);
    return { status: 0, data: booking, message: '预约更新成功' };
  }

  // 软删除预约（推荐用 PATCH，语义更清晰）
  @Patch(':bookingNumber/delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '软删除预约（将状态设为deleted）' })
  @ApiParam({ name: 'bookingNumber', description: '预约号' })
  @ApiResponse({
    status: 200,
    description: '预约软删除成功',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '预约已成功删除' },
        bookingNumber: { type: 'string', example: 'IR-20240315-001' },
      },
    },
  })
  async softDelete(@Param('bookingNumber') bookingNumber: string) {
    this.logger.log(`PATCH /bookings/${bookingNumber}/delete 软删除预约`);
    const result = await this.bookingsService.remove(bookingNumber);
    return { status: 0, ...result, message: '预约已成功删除' };
  }
}
