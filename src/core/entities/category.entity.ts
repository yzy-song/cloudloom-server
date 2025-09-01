/*
 * 产品分类实体 (大类)
 */
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Subcategory } from './subcategory.entity'; // 引入新的 Subcategory 实体

@Entity('categories')
export class Category {
  @ApiProperty({ description: '分类ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '分类名称', example: '女装' })
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @ApiPropertyOptional({ description: '分类描述', example: '汉服女装系列' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @ApiPropertyOptional({ description: '分类图片URL', example: 'https://example.com/cat.png' })
  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string;

  @ApiPropertyOptional({ description: '该大类下的子分类列表', type: () => [Subcategory] })
  @OneToMany(() => Subcategory, subcategory => subcategory.category)
  subcategories: Subcategory[];
}
