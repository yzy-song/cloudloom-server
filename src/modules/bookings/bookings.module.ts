/*
 * @Author: yzy
 * @Date: 2025-08-20 10:44:54
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-20 10:45:01
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Booking } from '../../core/entities/booking.entity';
import { Product } from '../../core/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Product])],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
