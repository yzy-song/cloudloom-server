/*
 * @Author: yzy
 * @Date: 2025-08-23 04:20:00
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-23 10:00:48
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from './product.entity';

@Entity('categories')
export class Category {
  @ApiProperty({ description: '分类ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '分类名称' })
  @Column({ name: 'name', length: 100, unique: true })
  name: string;

  @ApiProperty({ description: '分类描述', required: false })
  @Column({ name: 'description', type: 'text', nullable: true })
  desc: string;

  @ApiProperty({ description: '分类图片', required: false })
  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string;

  @OneToMany(() => Product, product => product.category)
  products: Product[];
}
