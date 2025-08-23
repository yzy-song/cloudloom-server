/*
 * @Author: yzy
 * @Date: 2025-08-23 04:22:49
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-23 04:22:59
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { Category } from '../../core/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: '创建新分类' })
  @ApiResponse({ status: 201, description: '分类创建成功', type: Category })
  @ApiResponse({ status: 409, description: '分类已存在' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有分类' })
  @ApiResponse({ status: 200, description: '返回所有分类列表', type: [Category] })
  findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取单个分类详情' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiResponse({ status: 200, description: '返回分类详情', type: Category })
  @ApiResponse({ status: 404, description: '分类未找到' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新分类信息' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiResponse({ status: 200, description: '分类更新成功', type: Category })
  @ApiResponse({ status: 404, description: '分类未找到' })
  @ApiResponse({ status: 409, description: '分类名称已存在' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除分类' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiResponse({ status: 204, description: '分类删除成功' })
  @ApiResponse({ status: 404, description: '分类未找到' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
