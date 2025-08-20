import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/create-product.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Product } from '../../core/entities/product.entity';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: '创建新产品' })
  @ApiResponse({
    status: 201,
    description: '产品创建成功',
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
  })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: '获取产品列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'dynasty', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'tag', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: '返回产品列表',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
        count: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('options/dynasties')
  @ApiOperation({ summary: '获取所有朝代选项' })
  @ApiResponse({
    status: 200,
    description: '返回所有朝代选项',
    type: [String],
  })
  getDynastyOptions() {
    return this.productsService.getDynastyOptions();
  }

  @Get('options/categories')
  @ApiOperation({ summary: '获取所有分类选项' })
  @ApiResponse({
    status: 200,
    description: '返回所有分类选项',
    type: [String],
  })
  getCategoryOptions() {
    return this.productsService.getCategoryOptions();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取产品详情' })
  @ApiParam({ name: 'id', description: '产品ID' })
  @ApiResponse({
    status: 200,
    description: '返回产品详情',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: '产品未找到',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新产品信息' })
  @ApiParam({ name: 'id', description: '产品ID' })
  @ApiResponse({
    status: 200,
    description: '产品更新成功',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: '产品未找到',
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除产品' })
  @ApiParam({ name: 'id', description: '产品ID' })
  @ApiResponse({
    status: 204,
    description: '产品删除成功',
  })
  @ApiResponse({
    status: 404,
    description: '产品未找到',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
