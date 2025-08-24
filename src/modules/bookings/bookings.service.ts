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

  // 新增：预约号生成服务
  private async generateBookingNumber(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.bookingsRepository.count({
      where: {
        createdAt: Between(new Date(date.setHours(0, 0, 0, 0)), new Date(date.setHours(23, 59, 59, 999))),
      },
    });

    return `IR-${dateStr}-${(count + 1).toString().padStart(3, '0')}`;
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

    // 验证逻辑调整
    if (createBookingDto.bookingType === 'standard') {
      if (!createBookingDto.productId) {
        throw new BadRequestException('标准预约需要选择产品');
      }
      // 检查产品存在性和库存
      const product = await this.productsRepository.findOne({
        where: { id: createBookingDto.productId },
      });
      if (!product) {
        throw new NotFoundException('产品不存在');
      }
    } else if (createBookingDto.bookingType === 'time_slot_only') {
      // 时段预留的特定验证
      if (!createBookingDto.participants) {
        throw new BadRequestException('时段预留需要提供预估人数');
      }
    }

    const booking = this.bookingsRepository.create({
      bookingNumber,
      ...createBookingDto,
      bookingType: createBookingDto.bookingType as 'standard' | 'time_slot_only',

      status: 'pending',
    });

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

  async update(id: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
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

  async remove(id: string): Promise<void> {
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
