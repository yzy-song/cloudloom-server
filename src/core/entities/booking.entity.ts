/*
 * @Author: yzy
 * @Date: 2025-08-19 22:52:47
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-24 13:00:06
 */

import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

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

  @Column({ name: 'customer_fullname', type: 'varchar', length: 50, nullable: true })
  customerFullname: string;

  @Column({ name: 'customer_email', type: 'varchar', length: 100, nullable: true })
  customerEmail: string;

  @Column({ name: 'customer_phone', type: 'varchar', length: 50, nullable: true })
  customerPhone?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'booking_date', type: 'date' })
  bookingDate: Date;

  @Column({ name: 'booking_time', type: 'time' })
  bookingTime: string;

  @Column({ type: 'integer', default: 1 })
  participants: number;

  @Column({ name: 'total_amount', type: 'numeric', precision: 10, scale: 2 })
  totalAmount: number;

  // 支持扩展状态
  /* pending	待确认	新创建的预约，等待商家确认
  confirmed	已确认	商家确认预约，等待客户到场
  completed	已完成	服务已完成，客户已离场
  cancelled	已取消	客户或商家主动取消
  no_show	未到场	客户未按预约时间到场 */
  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  status: BookingStatus;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ name: 'update_at', type: 'timestamptz', default: () => 'NOW()' })
  updateAt: Date;

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

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;
  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt?: Date;
}
