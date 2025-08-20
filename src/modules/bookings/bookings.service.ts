import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Booking, BookingStatus } from '../../core/entities/booking.entity';
import { Product } from '../../core/entities/product.entity';
// 在文件顶部导入 NotificationsService
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBookingDto, UpdateBookingDto, BookingQueryDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private notificationsService: NotificationsService
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const { productId, bookingDate, timeSlot } = createBookingDto;

    // 1. 检查产品是否存在且有库存
    const product = await this.productsRepository.findOne({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      throw new NotFoundException(`产品 #${productId} 未找到或已下架`);
    }

    if (product.stockQuantity < 1) {
      throw new ConflictException(`产品 "${product.title}" 库存不足`);
    }

    // 2. 检查时间段是否已被预约（同一产品同一天同一时间段）
    const existingBooking = await this.bookingsRepository.findOne({
      where: {
        productId,
        bookingDate: new Date(bookingDate),
        timeSlot,
        status: In(['pending', 'confirmed']), // 只检查有效状态的预约
      },
    });

    if (existingBooking) {
      throw new ConflictException(`该时间段已被预约，请选择其他时间`);
    }

    // 3. 创建预约
    try {
      const booking = this.bookingsRepository.create({
        ...createBookingDto,
        bookingDate: new Date(bookingDate),
        status: 'pending' as BookingStatus,
      });

      const savedBooking = await this.bookingsRepository.save(booking);

      await this.notificationsService.sendBookingConfirmation(savedBooking, product);

      // 4. 减少产品库存（乐观锁处理）
      await this.productsRepository
        .createQueryBuilder()
        .update(Product)
        .set({
          stockQuantity: () => 'stock_quantity - 1',
          updatedAt: new Date(),
        })
        .where('id = :id AND stock_quantity > 0', { id: productId })
        .execute();

      return savedBooking;
    } catch (error) {
      this.logger.error('发送预约确认邮件失败', error.stack);
      if (error.code === '23505') {
        throw new ConflictException('预约冲突，请重试');
      }
      throw new BadRequestException('创建预约失败: ' + error.message);
    }
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
      queryBuilder.andWhere('booking.customerName ILIKE :customer', {
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

  async findOne(id: number): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!booking) {
      throw new NotFoundException(`预约 #${id} 未找到`);
    }

    return booking;
  }

  async update(id: number, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!booking) {
      throw new NotFoundException(`预约 #${id} 未找到`);
    }

    try {
      // 处理状态变更逻辑
      if (updateBookingDto.status === 'cancelled' && booking.status !== 'cancelled') {
        // 取消预约时恢复库存
        await this.productsRepository
          .createQueryBuilder()
          .update(Product)
          .set({
            stockQuantity: () => 'stock_quantity + 1',
            updatedAt: new Date(),
          })
          .where('id = :id', { id: booking.productId })
          .execute();
      }

      // 在 update 方法中替换以下代码段：

      const updatedBooking = this.bookingsRepository.merge(booking, {
        ...updateBookingDto,
        bookingDate: updateBookingDto.bookingDate ? new Date(updateBookingDto.bookingDate) : booking.bookingDate,
        status: updateBookingDto.status ? (updateBookingDto.status as BookingStatus) : booking.status,
      });

      return await this.bookingsRepository.save(updatedBooking);
    } catch (error) {
      throw new BadRequestException('更新预约失败: ' + error.message);
    }
  }

  async remove(id: number): Promise<void> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!booking) {
      throw new NotFoundException(`预约 #${id} 未找到`);
    }

    // 删除预约前恢复库存
    if (booking.status !== 'cancelled') {
      await this.productsRepository
        .createQueryBuilder()
        .update(Product)
        .set({
          stockQuantity: () => 'stock_quantity + 1',
          updatedAt: new Date(),
        })
        .where('id = :id', { id: booking.productId })
        .execute();
    }

    const result = await this.bookingsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`预约 #${id} 未找到`);
    }
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

    const bookedSlotValues = bookedSlots.map(slot => slot.timeSlot);

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
