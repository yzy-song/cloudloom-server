/*
 * @Author: yzy
 * @Date: 2025-08-19 22:52:47
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-24 09:22:58
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from './product.entity';
import { User } from './user.entity';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

@Entity('bookings')
@Index(['bookingDate', 'timeSlot']) // 复合索引用于查询可用时间段
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 新增：对外预约号
  @Column({ name: 'booking_number', type: 'varchar', length: 20, unique: true })
  bookingNumber: string;

  // 修改：支持游客预约
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @Column({ name: 'customer_fullname', type: 'varchar', length: 50 })
  customerFullname: string;

  @Column({ name: 'customer_email', type: 'varchar', length: 100 })
  customerEmail: string;

  @Column({ name: 'customer_phone', type: 'varchar', length: 50, nullable: true })
  customerPhone?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'booking_date', type: 'date' })
  bookingDate: Date;

  @Column({ name: 'booking_time', type: 'time' })
  bookingTime: string;

  @Column({ type: 'integer' })
  participants: number;

  @Column({ name: 'total_amount', type: 'numeric', precision: 10, scale: 2 })
  totalAmount: number;

  // 修改：支持扩展状态
  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  status: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'no_show';

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ name: 'time_slot', type: 'varchar', length: 50, nullable: true })
  timeSlot?: string;

  @Column({ name: 'product_id', type: 'integer', nullable: true })
  productId?: number;

  // 新增：预约类型
  @Column({ name: 'booking_type', type: 'varchar', length: 20, default: 'standard' })
  bookingType: 'standard' | 'time_slot_only';

  // 新增：紧急联系人（可选）
  @Column({ name: 'emergency_contact', type: 'varchar', length: 100, nullable: true })
  emergencyContact?: string;
}
