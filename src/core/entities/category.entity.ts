/*
 * @Author: yzy
 * @Date: 2025-08-23 04:20:00
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-24 23:54:47
 */
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string;

  @OneToMany(() => Product, product => product.category)
  products: Product[];
}
