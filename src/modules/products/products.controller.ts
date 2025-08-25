/*
 * @Author: yzy
 * @Date: 2025-08-19 23:12:58
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-25 00:16:34
 */
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from '../../core/entities/product.entity';

@ApiTags('商品')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: '创建商品' })
  @ApiResponse({ status: 201, description: '创建成功', type: Product })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: '商品列表', description: '支持分页、分类、上下架、标签筛选' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 10 })
  @ApiQuery({ name: 'categoryId', required: false, description: '分类ID', example: 2 })
  @ApiQuery({ name: 'isActive', required: false, description: '是否上架', example: true })
  @ApiQuery({ name: 'tags', required: false, description: '标签，逗号分隔', example: '女装,古风' })
  @ApiResponse({ status: 200, description: '商品列表', type: [Product] })
  findAll(@Query('page', ParseIntPipe) page: number = 1, @Query('limit', ParseIntPipe) limit: number = 10, @Query('categoryId') categoryId?: number, @Query('isActive') isActive?: boolean, @Query('tags') tags?: string) {
    return this.productsService.findAll({ page, limit, categoryId, isActive, tags });
  }

  @Get(':id')
  @ApiOperation({ summary: '商品详情' })
  @ApiResponse({ status: 200, description: '商品详情', type: Product })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新商品' })
  @ApiResponse({ status: 200, description: '更新成功', type: Product })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除商品' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  @Patch(':id/stock-quantity')
  @ApiOperation({ summary: '修改库存' })
  @ApiResponse({ status: 200, description: '库存修改成功' })
  updateStockQuantity() {
    // ...实现...
  }

  @Patch(':id/active')
  @ApiOperation({ summary: '修改上架状态' })
  @ApiResponse({ status: 200, description: '上架状态修改成功' })
  updateActive() {
    // ...实现...
  }

  @Get(':id/related')
  @ApiOperation({ summary: '获取相关产品' })
  @ApiResponse({ status: 200, description: '相关产品列表', type: [Product] })
  async findRelated(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findRelated(id);
  }
}
