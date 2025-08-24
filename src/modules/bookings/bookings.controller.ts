import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/create-booking.dto';
import { BookingQueryDto } from './dto/booking-query.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Booking } from '../../core/entities/booking.entity';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('test')
  test() {
    return { message: 'Booking controller is working' };
  }

  @Post('create')
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
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  // ✅ 取消预约（软删除/状态变更）
  @Patch('cancel/:id')
  async cancel(@Param('id') id: string) {
    return this.bookingsService.cancel(id);
  }

  @Get('list')
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
  findAll(@Query() query: BookingQueryDto) {
    return this.bookingsService.findAll(query);
  }

  @Get('search')
  @ApiOperation({ summary: '高级搜索预约' })
  @ApiResponse({
    status: 200,
    description: '返回搜索结果',
    type: [Booking],
  })
  search(@Query() query: BookingQueryDto) {
    return this.bookingsService.searchBookings(query);
  }

  @Get('available-slots/:productId/:date')
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
  getAvailableTimeSlots(@Param('productId', ParseIntPipe) productId: number, @Param('date') date: string) {
    return this.bookingsService.getAvailableTimeSlots(productId, date);
  }

  @Get('daily/:date')
  @ApiOperation({ summary: '获取某天的所有预约' })
  @ApiParam({ name: 'date', description: '日期 (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: '返回当天的预约列表',
    type: [Booking],
  })
  getDailyBookings(@Param('date') date: string) {
    return this.bookingsService.getDailyBookings(date);
  }

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
  getBookingStats() {
    return this.bookingsService.getBookingStats();
  }

  @Get('detail/:bookingNumber')
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
    return this.bookingsService.findByBookingNumber(bookingNumber);
  }

  @Patch('update/:id')
  @ApiOperation({ summary: '更新预约信息' })
  @ApiParam({ name: 'id', description: '预约ID' })
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
  update(@Param('bookingNumber') bookingNumber: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(bookingNumber, updateBookingDto);
  }

  @Patch('delete/:bookingNumber')
  @HttpCode(HttpStatus.OK) // 改为 200 以便返回数据
  @ApiOperation({ summary: '软删除预约' })
  @ApiParam({ name: 'bookingNumber', description: '预约号' })
  @ApiResponse({
    status: 200,
    description: '预约删除成功',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '预约已成功删除' },
        bookingNumber: { type: 'string', example: 'IR-20240315-001' },
      },
    },
  })
  async remove(@Param('bookingNumber') bookingNumber: string) {
    return this.bookingsService.remove(bookingNumber);
  }
}
