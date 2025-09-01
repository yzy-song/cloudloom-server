/*
 * 产品子分类实体 (小类)
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category } from './category.entity';
import { Product } from './product.entity';

@Entity('subcategories')
export class Subcategory {
  @ApiProperty({ description: '子分类ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '子分类名称', example: '马面裙' })
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @ApiPropertyOptional({ description: '子分类描述', example: '明制马面裙系列' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiPropertyOptional({ description: '子分类图片URL', example: 'https://example.com/subcat.png' })
  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @ApiPropertyOptional({ description: '所属大类', type: () => Category })
  @ManyToOne(() => Category, category => category.subcategories, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ApiPropertyOptional({ description: '该子分类下的产品列表', type: () => [Product] })
  @OneToMany(() => Product, product => product.subcategory)
  products: Product[];
}
