import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('user_favorites')
export class UserFavorite {
  @ApiProperty({ description: '用户ID' })
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ApiProperty({ description: '产品ID' })
  @PrimaryColumn({ type: 'integer', name: 'product_id' })
  productId: number;

  @ApiProperty({ description: '收藏时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, product => product.favoritedBy)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
