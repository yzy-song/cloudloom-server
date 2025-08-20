/*
 * @Author: yzy
 * @Date: 2025-08-19 22:52:47
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-19 23:00:43
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from './product.entity';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

@Entity('bookings')
@Index(['bookingDate', 'timeSlot']) // 复合索引用于查询可用时间段
export class Booking {
  @ApiProperty({ description: '预约ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '客户姓名' })
  @Column({ name: 'customer_name', length: 255 })
  customerName: string;

  @ApiProperty({ description: '联系方式' })
  @Column({ name: 'contact_info', length: 255 })
  contactInfo: string;

  @ApiProperty({ description: '关联产品ID', required: false })
  @Column({ name: 'product_id', nullable: true })
  productId: number;

  @ApiProperty({ description: '选择尺寸' })
  @Column({ name: 'selected_size', length: 20 })
  selectedSize: string;

  @ApiProperty({ description: '预约日期' })
  @Column({ name: 'booking_date', type: 'date' })
  bookingDate: Date;

  @ApiProperty({ description: '时间段' })
  @Column({ name: 'time_slot', length: 50 })
  timeSlot: string;

  @ApiProperty({ description: '预约状态', enum: ['pending', 'confirmed', 'completed', 'cancelled'] })
  @Column({ default: 'pending' })
  status: BookingStatus;

  @ApiProperty({ description: '备注', required: false })
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty({ description: '总价格' })
  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => Product, (product) => product.bookings, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
