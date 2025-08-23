/*
 * @Author: yzy
 * @Date: 2025-08-19 22:52:47
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-23 08:53:13
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from './product.entity';
import { User } from './user.entity';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

@Entity('bookings')
@Index(['bookingDate', 'timeSlot']) // 复合索引用于查询可用时间段
export class Booking {
  @ApiProperty({ description: '预约ID' })
  @PrimaryGeneratedColumn('uuid') // 修改为UUID类型
  id: string; // 修改为string类型

  @ApiProperty({ description: '用户ID' })
  @Column({ name: 'user_id', type: 'uuid' }) // 添加用户ID字段
  userId: string;

  @ApiProperty({ description: '客户姓名' })
  @Column({ name: 'customer_username', length: 100 }) // 修改长度为100
  customerName: string;

  @ApiProperty({ description: '客户邮箱' })
  @Column({ name: 'customer_email', length: 255 })
  customerEmail: string;

  @ApiProperty({ description: '客户电话' })
  @Column({ name: 'customer_phone', length: 50, nullable: true }) // 允许为空
  customerPhone: string;

  @ApiProperty({ description: '备注', required: false })
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty({ description: '预约日期' })
  @Column({ name: 'booking_date', type: 'date' })
  bookingDate: Date;

  @ApiProperty({ description: '预约时间' })
  @Column({ name: 'booking_time', type: 'time' }) // 添加预约时间字段
  bookingTime: string; // 使用string类型存储时间

  @ApiProperty({ description: '时间段' })
  @Column({ name: 'time_slot', length: 50, nullable: true }) // 允许为空
  timeSlot: string;

  @ApiProperty({ description: '参与人数' })
  @Column({ type: 'integer' }) // 添加参与人数字段
  participants: number;

  @ApiProperty({ description: '总金额' })
  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 }) // 修改为total_amount
  totalAmount: number; // 修改字段名

  @ApiProperty({ description: '预约状态', enum: ['pending', 'confirmed', 'cancelled', 'completed'] })
  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
    // 注意：CHECK约束需要在数据库层面设置，TypeORM不直接支持
  })
  status: BookingStatus;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) // 修改为timestamptz类型
  createdAt: Date;

  // 移除了updatedAt字段，因为数据库表中没有该字段

  // 关联关系
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) // 关联到User实体
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 如果需要保留产品关联，可以保留以下代码，但数据库表结构中未体现
  @ManyToOne(() => Product, product => product.bookings, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_id', nullable: true }) // 对应的外键字段
  productId: number;
}
