/*
 * @Author: yzy
 * @Date: 2025-08-19 22:52:00
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-23 09:42:07
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Booking } from './booking.entity';
import { Category } from './category.entity';

@Entity('products')
export class Product {
  @ApiProperty({ description: '产品ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '产品标题' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ description: '产品描述', required: false })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({ description: '价格' })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  // 更改为与 Category 实体关联
  @ApiProperty({ description: '分类', type: () => Category })
  @ManyToOne(() => Category, category => category.products, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ApiProperty({ description: '朝代' })
  @Column({ length: 50 })
  dynasty: string;

  @ApiProperty({ description: '朝代标签' })
  @Column({ name: 'dynasty_label', type: 'varchar', length: 20, nullable: true })
  dynastyLabel: string;

  @ApiProperty({ description: '材质', required: false })
  @Column({ length: 200, nullable: true })
  material: string;

  @ApiProperty({ description: '尺寸选项', type: [String] })
  @Column('jsonb', { default: [] })
  sizeOptions: string[];

  @ApiProperty({ description: '保养说明', required: false })
  @Column('text', { nullable: true })
  careInstructions: string;

  @ApiProperty({ description: '产品详情', type: [String] })
  @Column('jsonb', { default: [] })
  details: string[];

  @ApiProperty({ description: '标签', type: [String] })
  @Column('jsonb', { default: [] })
  tags: string[];

  @ApiProperty({ description: '图片URL列表', type: [String] })
  @Column('jsonb', { default: [] })
  images: string[];

  @ApiProperty({ description: '评价数量' })
  @Column({ default: 0 })
  reviews: number;

  @ApiProperty({ description: '是否激活' })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({ description: '库存数量' })
  @Column({ name: 'stock_quantity', default: 0 })
  stockQuantity: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt: Date;

  @OneToMany(() => Booking, booking => booking.product)
  bookings: Booking[];
}
