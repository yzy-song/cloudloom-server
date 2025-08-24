/*
 * @Author: yzy
 * @Date: 2025-08-19 22:52:00
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-24 23:17:27
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Category } from './category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  dynasty: string;

  @Column({ type: 'varchar', length: 20, name: 'dynasty_label' })
  dynastyLabel: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'integer', default: 0, name: 'stock_quantity' })
  stockQuantity: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  material: string;

  @Column({ type: 'jsonb', default: [] })
  images: any[];

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ type: 'jsonb', default: [], name: 'size_options' })
  sizeOptions: any[];

  @Column({ type: 'jsonb', default: [] })
  details: any[];

  @Column({ type: 'text', name: 'care_instructions', nullable: true })
  careInstructions: string;

  @Column({ type: 'integer', default: 0 })
  reviews: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Category, category => category.products, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'category_id', nullable: true })
  categoryId: number;
}
