/*
 * @Author: yzy
 * @Date: 2025-08-19 23:12:58
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-25 00:16:34
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // 创建商品
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // 商品列表，支持分页、分类、上下架筛选
  @Get()
  findAll(@Query('page', ParseIntPipe) page: number = 1, @Query('limit', ParseIntPipe) limit: number = 10, @Query('categoryId') categoryId?: number, @Query('isActive') isActive?: boolean, @Query('tags') tags?: string) {
    // 支持标签筛选
    const tagArray = tags ? tags.split(',') : undefined;
    return this.productsService.findAll(page, limit, categoryId, isActive, tagArray);
  }

  // 商品详情
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  // 更新商品
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  // 删除商品
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  // 修改库存
  @Patch(':id/stock-quantity')
  updateStock(@Param('id', ParseIntPipe) id: number, @Body('quantity', ParseIntPipe) quantity: number) {
    return this.productsService.updateStock(id, quantity);
  }

  // 上下架（激活/禁用）
  @Patch(':id/active')
  updateActive(@Param('id', ParseIntPipe) id: number, @Body('isActive') isActive: boolean) {
    return this.productsService.updateActiveStatus(id, isActive);
  }
}
