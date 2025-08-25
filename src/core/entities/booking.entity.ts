/*
 * 预约实体，记录客户预约信息
 */
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'deleted' | 'no_show';

@Entity('bookings')
@Index(['bookingDate', 'timeSlot']) // 复合索引用于查询可用时间段
export class Booking {
  @ApiProperty({ description: '预约ID', example: 'a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '预约编号', example: 'BK202408250001' })
  @Column({ name: 'booking_number', type: 'varchar', length: 20, unique: true })
  bookingNumber: string;

  @ApiPropertyOptional({ description: '用户ID', example: 'a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx' })
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @ApiProperty({ description: '客户姓名', example: '张三' })
  @Column({ name: 'customer_fullname', type: 'varchar', length: 50, nullable: true })
  customerFullname: string;

  @ApiProperty({ description: '客户邮箱', example: 'zhangsan@email.com' })
  @Column({ name: 'customer_email', type: 'varchar', length: 100, nullable: true })
  customerEmail: string;

  @ApiPropertyOptional({ description: '客户电话', example: '13800000000' })
  @Column({ name: 'customer_phone', type: 'varchar', length: 50, nullable: true })
  customerPhone?: string;

  @ApiPropertyOptional({ description: '备注', example: '需要儿童尺寸' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: '预约日期', example: '2024-03-15' })
  @Column({ name: 'booking_date', type: 'date' })
  bookingDate: string;

  @ApiProperty({ description: '预约时间', example: '10:00' })
  @Column({ name: 'booking_time', type: 'time' })
  bookingTime: string;

  @ApiProperty({ description: '参与人数', example: 2 })
  @Column({ type: 'integer', default: 1 })
  participants: number;

  @ApiProperty({ description: '总金额', example: 89.99 })
  @Column({ name: 'total_amount', type: 'numeric', precision: 10, scale: 2 })
  totalAmount: number;

  @ApiProperty({ description: '预约状态', enum: ['pending', 'confirmed', 'completed', 'cancelled', 'deleted', 'no_show'], example: 'pending' })
  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  status: BookingStatus;

  @ApiProperty({ description: '创建时间', example: '2025-08-23T03:57:16.000Z' })
  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2025-08-23T06:29:13.000Z' })
  @Column({ name: 'update_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: '时间段', example: '10:00 - 11:30' })
  @Column({ name: 'time_slot', type: 'varchar', length: 50, nullable: true })
  timeSlot?: string;

  @ApiPropertyOptional({ description: '产品ID', example: 1 })
  @Column({ name: 'product_id', type: 'integer', nullable: true })
  productId?: number;

  @ApiProperty({ description: '预约类型', enum: ['standard', 'time_slot_only'], example: 'standard' })
  @Column({ name: 'booking_type', type: 'varchar', length: 20, default: 'standard' })
  bookingType: 'standard' | 'time_slot_only';

  @ApiPropertyOptional({ description: '紧急联系人', example: '李四 +353 987654321' })
  @Column({ name: 'emergency_contact', type: 'varchar', length: 100, nullable: true })
  emergencyContact?: string;

  @ApiPropertyOptional({ description: '删除时间', example: null })
  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @ApiPropertyOptional({ description: '取消时间', example: null })
  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt?: Date;
}
