import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFavorite } from '../../core/entities/user-favorite.entity';
import { UserFavoritesController } from './user-favorites.controller';
import { UserFavoritesService } from './user-favorites.service';
import { Product } from 'src/core/entities/product.entity';
import { User } from 'src/core/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserFavorite, Product, User])],
  controllers: [UserFavoritesController],
  providers: [UserFavoritesService],
})
export class UserFavoritesModule {}
