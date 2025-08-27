/*
 * @Author: yzy
 * @Date: 2025-08-23 04:09:02
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-27 23:18:09
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from '../../core/entities/product.entity';
import { Category } from 'src/core/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
