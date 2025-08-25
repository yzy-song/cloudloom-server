/*
 * 产品实体，包含商品的详细信息
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Category } from './category.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('products')
export class Product {
  @ApiProperty({ description: '产品ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '产品标题', example: '汉服长裙' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiPropertyOptional({ description: '产品描述', example: '优质面料，古风设计' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: '所属朝代', example: '唐' })
  @Column({ type: 'varchar', length: 50 })
  dynasty: string;

  @ApiProperty({ description: '朝代标签', example: 'Tang' })
  @Column({ type: 'varchar', length: 20, name: 'dynasty_label' })
  dynastyLabel: string;

  @ApiProperty({ description: '价格', example: 299.99 })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  price: number;

  @ApiProperty({ description: '库存数量', example: 100 })
  @Column({ type: 'integer', default: 0, name: 'stock_quantity' })
  stockQuantity: number;

  @ApiPropertyOptional({ description: '材质', example: '棉麻' })
  @Column({ type: 'varchar', length: 200, nullable: true })
  material: string;

  @ApiProperty({ description: '产品图片列表', type: [String], example: ['https://example.com/1.png'] })
  @Column({ type: 'jsonb', default: [] })
  images: any[];

  @ApiProperty({ description: '标签', type: [String], example: ['古风', '女装'] })
  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @ApiProperty({ description: '可选尺码', type: [Object], example: [{ size: 'M', desc: '中码' }] })
  @Column({ type: 'jsonb', default: [], name: 'size_options' })
  sizeOptions: any[];

  @ApiProperty({ description: '产品详情', type: [Object], example: [{ key: '成分', value: '100%棉' }] })
  @Column({ type: 'jsonb', default: [] })
  details: any[];

  @ApiPropertyOptional({ description: '护理说明', example: '建议手洗' })
  @Column({ type: 'text', name: 'care_instructions', nullable: true })
  careInstructions: string;

  @ApiProperty({ description: '评论数', example: 12 })
  @Column({ type: 'integer', default: 0 })
  reviews: number;

  @ApiProperty({ description: '是否上架', example: true })
  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @ApiProperty({ description: '创建时间', example: '2025-08-23T03:57:16.000Z' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2025-08-23T06:29:13.000Z' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: '所属分类', type: () => Category })
  @ManyToOne(() => Category, category => category.products, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ApiPropertyOptional({ description: '分类ID', example: 2 })
  @Column({ name: 'category_id', nullable: true })
  categoryId: number;
}
