/*
 * @Author: yzy
 * @Date: 2025-08-20 10:46:49
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-23 07:09:29
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from '../products/products.service';
import { ProductsController } from '../products/products.controller';
import { Product } from '../../core/entities/product.entity';
import { Category } from '../../core/entities/category.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category]), // Add Category to forFeature
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
