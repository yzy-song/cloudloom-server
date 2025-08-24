import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Booking, BookingStatus } from '../../core/entities/booking.entity';
import { Product } from '../../core/entities/product.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBookingDto, UpdateBookingDto, BookingQueryDto } from './dto/create-booking.dto';

import { AppLogger } from '../../utils/logger';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private notificationsService: NotificationsService,
    private readonly logger: AppLogger // 依赖注入
  ) {
    this.logger.setContext(BookingsService.name);
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
    const booking = await this.bookingsRepository.findOne({
      where: { bookingNumber },
      relations: ['product'],
    });

    if (!booking) {
      throw new NotFoundException('预约不存在');
    }

    return booking;
  }

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    // 生成预约号
    const bookingNumber = await this.generateBookingNumber();

    // 验证逻辑
    if (createBookingDto.bookingType === 'standard' && !createBookingDto.productId) {
      throw new BadRequestException('标准预约需要选择产品');
    }

    if (createBookingDto.bookingType === 'time_slot_only') {
      // 时段预留时清空productId
      createBookingDto.productId = undefined;
    }

    const bookingData = {
      ...createBookingDto,
      bookingNumber,

      bookingType: createBookingDto.bookingType as Booking['bookingType'],
    };

    const booking = this.bookingsRepository.create(bookingData);
    return await this.bookingsRepository.save(booking);
  }

  async remove(bookingNumber: string): Promise<{ message: string; bookingNumber: string }> {
    const booking = await this.bookingsRepository.findOne({
      where: { bookingNumber },
    });

    if (!booking) {
      throw new NotFoundException(`预约号 ${bookingNumber} 未找到`);
    }

    // 软删除：更新状态而不是物理删除
    booking.status = 'cancelled';
    booking.deletedAt = new Date();

    await this.bookingsRepository.save(booking);

    this.logger.log(`预约 ${bookingNumber} 已软删除`);

    return {
      message: '预约已成功删除',
      bookingNumber: bookingNumber,
    };
  }
  async cancel(bookingNumber: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { bookingNumber },
      // 移除 relations: ['product']，因为 Booking 实体中没有 product 关系
    });

    if (!booking) {
      throw new NotFoundException(`预约号 ${bookingNumber} 未找到`);
    }

    // 业务规则：只有特定状态可以取消
    if (!['pending', 'confirmed'].includes(booking.status)) {
      throw new BadRequestException('当前状态无法取消预约');
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();

    return await this.bookingsRepository.save(booking);
  }

  async findAll(query: BookingQueryDto): Promise<{ data: Booking[]; count: number; page: number; limit: number }> {
    const { page = 1, limit = 1, status, date, customer } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.bookingsRepository.createQueryBuilder('booking').leftJoinAndSelect('booking.product', 'product');

    // 添加筛选条件
    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      queryBuilder.andWhere('booking.bookingDate >= :startDate AND booking.bookingDate < :endDate', {
        startDate,
        endDate,
      });
    }

    if (customer) {
      queryBuilder.andWhere('booking.customerFullname ILIKE :customer', {
        customer: `%${customer}%`,
      });
    }

    // 按时间倒序排列
    queryBuilder.orderBy('booking.createdAt', 'DESC');

    // 获取总数
    const total = await queryBuilder.getCount();

    // 添加分页
    queryBuilder.skip(skip).take(limit);

    const data = await queryBuilder.getMany();

    return {
      data,
      count: total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!booking) {
      throw new NotFoundException(`预约 #${id} 未找到`);
    }

    return booking;
  }

  // ... existing imports ...

  async update(bookingNumber: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { bookingNumber },
    });

    if (!booking) {
      throw new NotFoundException(`预约号 ${bookingNumber} 未找到`);
    }

    // 业务规则：已取消或完成的预约不能修改
    if (['cancelled', 'completed', 'no_show'].includes(booking.status)) {
      throw new BadRequestException('当前状态的预约无法修改');
    }

    // 更新允许修改的字段
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
      booking.bookingDate = new Date(updateBookingDto.bookingDate);
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
      // 状态变更需要特殊处理
      booking.status = updateBookingDto.status;
    }

    // 自动更新更新时间
    booking.updateAt = new Date();

    return await this.bookingsRepository.save(booking);
  }

  async getAvailableTimeSlots(productId: number, date: string): Promise<string[]> {
    const allTimeSlots = ['10:00 - 11:30', '11:30 - 13:00', '13:00 - 14:30', '14:30 - 16:00', '16:00 - 17:30'];

    // 获取该产品在指定日期已被预约的时间段
    const bookedSlots = await this.bookingsRepository
      .createQueryBuilder('booking')
      .select('booking.timeSlot')
      .where('booking.productId = :productId', { productId })
      .andWhere('booking.bookingDate = :date', { date: new Date(date) })
      .andWhere('booking.status IN (:...statuses)', {
        statuses: ['pending', 'confirmed'],
      })
      .getMany();

    const bookedSlotValues = bookedSlots.map(slot => slot.bookingTime);

    // 返回可用的时间段
    return allTimeSlots.filter(slot => !bookedSlotValues.includes(slot));
  }

  async getDailyBookings(date: string): Promise<Booking[]> {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    return this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.product', 'product')
      .where('booking.bookingDate >= :startDate AND booking.bookingDate < :endDate', {
        startDate,
        endDate,
      })
      .orderBy('booking.timeSlot', 'ASC')
      .getMany();
  }

  // 统计方法
  async getBookingStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  }> {
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

    return result;
  }
}
