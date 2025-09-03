/*
 * @Author: yzy
 * @Date: 2025-08-24 13:48:54
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-26 02:49:40
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../../core/entities/booking.entity';
import { Product } from '../../core/entities/product.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/create-booking.dto';
import { BookingQueryDto } from './dto/booking-query.dto';
import { AppLogger } from '../../utils/logger';

import { ConfigService } from '@nestjs/config';
import { Stripe } from 'stripe';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class BookingsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(Product)
    private notificationsService: NotificationsService,
    private paymentsService: PaymentsService,
    private readonly logger: AppLogger, // 依赖注入
    private readonly configService: ConfigService
  ) {
    this.logger.setContext(BookingsService.name);
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-07-30.basil',
    });
  }

  // 新增：预约号生成服务
  private async generateBookingNumber(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

    // 使用数据库的原子性操作生成唯一序号
    const result = await this.bookingsRepository.query(
      `SELECT COALESCE(MAX(SUBSTRING(booking_number FROM LENGTH('IR-${dateStr}-')+1)::INTEGER), 0) + 1 AS next_val 
     FROM bookings 
     WHERE booking_number LIKE 'IR-${dateStr}-%'`
    );

    const nextVal = result[0].next_val;
    return `IR-${dateStr}-${nextVal.toString().padStart(3, '0')}`;
  }

  async findByBookingNumber(bookingNumber: string): Promise<Booking> {
    this.logger.log(`查询预约详情 bookingNumber=${bookingNumber}`);
    const booking = await this.bookingsRepository.findOne({
      where: { bookingNumber },
    });

    if (!booking) {
      this.logger.error('预约详情未找到', undefined, { bookingNumber });
      throw new NotFoundException('预约不存在');
    }

    this.logger.log('预约详情获取成功', { bookingNumber });
    return booking;
  }

  async create(createBookingDto: CreateBookingDto): Promise<{ code: number; message: string; data: Booking & { client_secret: string } }> {
    this.logger.log('创建预约', { createBookingDto });
    const bookingNumber = await this.generateBookingNumber();

    if (createBookingDto.bookingType === 'standard' && !createBookingDto.productId) {
      this.logger.error('创建预约失败，标准预约缺少产品', undefined, { createBookingDto });
      throw new BadRequestException('标准预约需要选择产品');
    }

    if (createBookingDto.bookingType === 'time_slot_only') {
      createBookingDto.productId = undefined;
    }

    const bookingData = {
      ...createBookingDto,
      bookingNumber,
      bookingType: createBookingDto.bookingType as Booking['bookingType'],
    };

    const booking = this.bookingsRepository.create(bookingData);
    try {
      const saved = await this.bookingsRepository.save(booking);
      this.logger.log('预约创建成功', { bookingNumber: saved.bookingNumber });
      const paymentResult = await this.paymentsService.createPayment({
        amount: Math.round(saved.totalAmount * 100),
        currency: 'usd',
        description: `预约号：${saved.bookingNumber}`,
      });
      return {
        code: 0,
        message: '预约成功',
        data: {
          ...saved,
          client_secret: paymentResult.client_secret ?? '',
        },
      };
    } catch (error) {
      this.logger.error('预约创建失败', error?.stack, { createBookingDto });
      throw error;
    }
  }

  async remove(bookingNumber: string): Promise<{ message: string; bookingNumber: string }> {
    this.logger.log(`软删除预约 bookingNumber=${bookingNumber}`);
    const booking = await this.bookingsRepository.findOne({
      where: { bookingNumber },
    });

    if (!booking) {
      this.logger.error('软删除预约失败，未找到', undefined, { bookingNumber });
      throw new NotFoundException(`预约号 ${bookingNumber} 未找到`);
    }

    booking.status = 'deleted';
    booking.deletedAt = new Date();

    try {
      await this.bookingsRepository.save(booking);
      this.logger.log('预约软删除成功', { bookingNumber });
      return {
        message: '预约已成功删除',
        bookingNumber: bookingNumber,
      };
    } catch (error) {
      this.logger.error('预约软删除失败', error?.stack, { bookingNumber });
      throw error;
    }
  }
  async cancel(bookingNumber: string): Promise<Booking> {
    this.logger.log(`取消预约 bookingNumber=${bookingNumber}`);
    const booking = await this.bookingsRepository.findOne({
      where: { bookingNumber },
    });

    if (!booking) {
      this.logger.error('取消预约失败，未找到', undefined, { bookingNumber });
      throw new NotFoundException(`预约号 ${bookingNumber} 未找到`);
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      this.logger.error('取消预约失败，状态不允许', undefined, { bookingNumber, status: booking.status });
      throw new BadRequestException('当前状态无法取消预约');
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();

    try {
      const saved = await this.bookingsRepository.save(booking);
      this.logger.log('预约取消成功', { bookingNumber });
      return saved;
    } catch (error) {
      this.logger.error('预约取消失败', error?.stack, { bookingNumber });
      throw error;
    }
  }

  async findAll(query: BookingQueryDto): Promise<{ data: Booking[]; count: number; page: number; limit: number }> {
    this.logger.log('查询预约列表', query);
    const { page = 1, limit = 10, status, startDate, endDate, customerName, customerEmail, bookingType, order = 'DESC' } = query;
    const skip = (page - 1) * limit;
    const queryBuilder = this.bookingsRepository.createQueryBuilder('booking');
    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }
    if (bookingType) {
      queryBuilder.andWhere('booking.bookingType = :bookingType', { bookingType });
    }
    if (startDate && endDate) {
      queryBuilder.andWhere('booking.bookingDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('booking.bookingDate >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('booking.bookingDate <= :endDate', { endDate });
    }
    if (customerName) {
      queryBuilder.andWhere('booking.customerFullname ILIKE :customerName', {
        customerName: `%${customerName}%`,
      });
    }
    if (customerEmail) {
      queryBuilder.andWhere('booking.customerEmail ILIKE :customerEmail', {
        customerEmail: `%${customerEmail}%`,
      });
    }
    queryBuilder.andWhere('booking.status != :deletedStatus', { deletedStatus: 'deleted' });
    queryBuilder.orderBy('booking.createdAt', order);
    try {
      const total = await queryBuilder.getCount();
      queryBuilder.skip(skip).take(limit);
      const data = await queryBuilder.getMany();
      this.logger.log('预约列表获取成功', { total });
      return {
        data,
        count: total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error('预约列表获取失败', error?.stack, query);
      throw error;
    }
  }

  async findOne(bookingNumber: string): Promise<Booking> {
    this.logger.log(`查询预约 bookingNumber=${bookingNumber}`);
    const booking = await this.bookingsRepository.findOne({
      where: { bookingNumber },
    });

    if (!booking) {
      this.logger.error('预约未找到', undefined, { bookingNumber });
      throw new NotFoundException(`预约号 #${bookingNumber} 未找到`);
    }

    this.logger.log('预约获取成功', { bookingNumber });
    return booking;
  }

  async searchBookings(query: BookingQueryDto): Promise<{ data: Booking[]; count: number }> {
    this.logger.log('高级搜索预约', query);
    const { status, startDate, endDate, customerName, customerEmail, bookingType } = query;
    const queryBuilder = this.bookingsRepository.createQueryBuilder('booking');
    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }
    if (bookingType) {
      queryBuilder.andWhere('booking.bookingType = :bookingType', { bookingType });
    }
    if (startDate && endDate) {
      queryBuilder.andWhere('booking.bookingDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('booking.bookingDate >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('booking.bookingDate <= :endDate', { endDate });
    }
    if (customerName) {
      queryBuilder.andWhere('booking.customerFullname ILIKE :customerName', {
        customerName: `%${customerName}%`,
      });
    }
    if (customerEmail) {
      queryBuilder.andWhere('booking.customerEmail ILIKE :customerEmail', {
        customerEmail: `%${customerEmail}%`,
      });
    }
    queryBuilder.andWhere('booking.status != :deletedStatus', { deletedStatus: 'deleted' });
    try {
      const [data, count] = await queryBuilder.getManyAndCount();
      this.logger.log('高级搜索预约成功', { count });
      return { data, count };
    } catch (error) {
      this.logger.error('高级搜索预约失败', error?.stack, query);
      throw error;
    }
  }

  async update(bookingNumber: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    this.logger.log(`更新预约 bookingNumber=${bookingNumber}`, { updateBookingDto });
    const booking = await this.bookingsRepository.findOne({
      where: { bookingNumber },
    });

    if (!booking) {
      this.logger.error('更新预约失败，未找到', undefined, { bookingNumber });
      throw new NotFoundException(`预约号 ${bookingNumber} 未找到`);
    }

    if (['cancelled', 'completed', 'no_show'].includes(booking.status)) {
      this.logger.error('更新预约失败，状态不允许', undefined, { bookingNumber, status: booking.status });
      throw new BadRequestException('当前状态的预约无法修改');
    }

    if (updateBookingDto.customerFullname !== undefined) {
      booking.customerFullname = updateBookingDto.customerFullname;
    }
    if (updateBookingDto.customerEmail !== undefined) {
      booking.customerEmail = updateBookingDto.customerEmail;
    }
    if (updateBookingDto.customerPhone !== undefined) {
      booking.customerPhone = updateBookingDto.customerPhone;
    }
    if (updateBookingDto.bookingDate !== undefined) {
      booking.bookingDate = updateBookingDto.bookingDate;
    }
    if (updateBookingDto.bookingTime !== undefined) {
      booking.bookingTime = updateBookingDto.bookingTime;
    }
    if (updateBookingDto.timeSlot !== undefined) {
      booking.timeSlot = updateBookingDto.timeSlot;
    }
    if (updateBookingDto.participants !== undefined) {
      booking.participants = updateBookingDto.participants;
    }
    if (updateBookingDto.totalAmount !== undefined) {
      booking.totalAmount = updateBookingDto.totalAmount;
    }
    if (updateBookingDto.notes !== undefined) {
      booking.notes = updateBookingDto.notes;
    }
    if (updateBookingDto.emergencyContact !== undefined) {
      booking.emergencyContact = updateBookingDto.emergencyContact;
    }
    if (updateBookingDto.status !== undefined) {
      booking.status = updateBookingDto.status;
    }
    booking.updatedAt = new Date();
    try {
      const saved = await this.bookingsRepository.save(booking);
      this.logger.log('预约更新成功', { bookingNumber });
      return saved;
    } catch (error) {
      this.logger.error('预约更新失败', error?.stack, { bookingNumber, updateBookingDto });
      throw error;
    }
  }

  async getAvailableTimeSlots(productId: number, date: string): Promise<string[]> {
    this.logger.log(`查询可用时间段 productId=${productId}, date=${date}`);
    const allTimeSlots = ['10:00 - 11:30', '11:30 - 13:00', '13:00 - 14:30', '14:30 - 16:00', '16:00 - 17:30'];
    try {
      const bookedSlots = await this.bookingsRepository
        .createQueryBuilder('booking')
        .select('booking.timeSlot')
        .where('booking.productId = :productId', { productId })
        .andWhere('booking.bookingDate = :date', { date })
        .andWhere('booking.status IN (:...statuses)', {
          statuses: ['pending', 'confirmed'],
        })
        .getMany();
      const bookedSlotValues = bookedSlots.map(slot => slot.timeSlot);
      const available = allTimeSlots.filter(slot => !bookedSlotValues.includes(slot));
      this.logger.log('可用时间段查询成功', { productId, date, available });
      return available;
    } catch (error) {
      this.logger.error('可用时间段查询失败', error?.stack, { productId, date });
      throw error;
    }
  }

  async getDailyBookings(date: string): Promise<Booking[]> {
    this.logger.log(`查询某天所有预约 date=${date}`);
    try {
      const bookings = await this.bookingsRepository
        .createQueryBuilder('booking')
        .where('booking.bookingDate = :date', { date })
        .andWhere('booking.status NOT IN (:...excludedStatuses)', {
          excludedStatuses: ['cancelled', 'no_show', 'deleted'],
        })
        .orderBy('booking.bookingTime', 'ASC')
        .getMany();
      this.logger.log('某天所有预约查询成功', { date, count: bookings.length });
      return bookings;
    } catch (error) {
      this.logger.error('某天所有预约查询失败', error?.stack, { date });
      throw error;
    }
  }

  async getProductDailyBookings(productId: number, date: string): Promise<Booking[]> {
    this.logger.log(`查询某产品某天所有预约 productId=${productId}, date=${date}`);
    try {
      const bookings = await this.bookingsRepository
        .createQueryBuilder('booking')
        .where('booking.productId = :productId', { productId })
        .andWhere('booking.bookingDate = :date', { date })
        .andWhere('booking.status NOT IN (:...excludedStatuses)', {
          excludedStatuses: ['cancelled', 'no_show', 'deleted'],
        })
        .orderBy('booking.bookingTime', 'ASC')
        .getMany();
      this.logger.log('某产品某天所有预约查询成功', { productId, date, count: bookings.length });
      return bookings;
    } catch (error) {
      this.logger.error('某产品某天所有预约查询失败', error?.stack, { productId, date });
      throw error;
    }
  }

  // 统计方法
  async getBookingStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  }> {
    this.logger.log('查询预约统计');
    try {
      const stats = await this.bookingsRepository.createQueryBuilder('booking').select('booking.status', 'status').addSelect('COUNT(*)', 'count').groupBy('booking.status').getRawMany();
      const result = {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
      };
      stats.forEach(stat => {
        const count = parseInt(stat.count);
        result.total += count;
        result[stat.status] = count;
      });
      this.logger.log('预约统计查询成功', result);
      return result;
    } catch (error) {
      this.logger.error('预约统计查询失败', error?.stack);
      throw error;
    }
  }
}
