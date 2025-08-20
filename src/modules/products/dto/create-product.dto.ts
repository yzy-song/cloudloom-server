import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsBoolean,
  Min,
  Max,
  ArrayNotEmpty,
  IsPositive,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ description: '产品标题', example: '唐风齐胸襦裙 · 霓裳羽衣' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: '产品描述',
    example: '灵感来自盛唐时期的女子服饰，采用真丝提花面料，裙头绣有传统缠枝纹样',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '价格', example: 89.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: '产品分类', example: '齐胸襦裙' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: '朝代', example: 'tang' })
  @IsString()
  @IsNotEmpty()
  dynasty: string;

  @ApiProperty({ description: '朝代标签', example: '唐' })
  @IsString()
  @IsNotEmpty()
  dynastyLabel: string;

  @ApiPropertyOptional({ description: '材质', example: '100%桑蚕丝' })
  @IsString()
  @IsOptional()
  material?: string;

  @ApiProperty({ description: '尺寸选项', example: ['S', 'M', 'L', 'XL'] })
  @IsArray()
  @ArrayNotEmpty()
  sizeOptions: string[];

  @ApiPropertyOptional({ description: '保养说明', example: '手洗，不可漂白，低温熨烫' })
  @IsString()
  @IsOptional()
  careInstructions?: string;

  @ApiProperty({ description: '产品详情', example: ['100% 天然桑蚕丝面料', '手工刺绣装饰纹样'] })
  @IsArray()
  details: string[];

  @ApiProperty({ description: '标签', example: ['热门', '新品', '真丝'] })
  @IsArray()
  tags: string[];

  @ApiProperty({ description: '图片URL列表', example: ['image1.jpg', 'image2.jpg'] })
  @IsArray()
  images: string[];

  @ApiPropertyOptional({ description: '评价数量', example: 28 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  reviews?: number;

  @ApiPropertyOptional({ description: '是否激活', example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: '库存数量', example: 5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ description: '产品标题', example: '唐风齐胸襦裙 · 霓裳羽衣' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: '产品描述', example: '灵感来自盛唐时期的女子服饰...' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '价格', example: 89.99 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ description: '产品分类', example: '齐胸襦裙' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: '朝代', example: 'tang' })
  @IsString()
  @IsOptional()
  dynasty?: string;

  @ApiPropertyOptional({ description: '朝代标签', example: '唐' })
  @IsString()
  @IsOptional()
  dynastyLabel?: string;

  @ApiPropertyOptional({ description: '材质', example: '100%桑蚕丝' })
  @IsString()
  @IsOptional()
  material?: string;

  @ApiPropertyOptional({ description: '尺寸选项', example: ['S', 'M', 'L', 'XL'] })
  @IsArray()
  @IsOptional()
  sizeOptions?: string[];

  @ApiPropertyOptional({ description: '保养说明', example: '手洗，不可漂白，低温熨烫' })
  @IsString()
  @IsOptional()
  careInstructions?: string;

  @ApiPropertyOptional({
    description: '产品详情',
    example: ['100% 天然桑蚕丝面料', '手工刺绣装饰纹样'],
  })
  @IsArray()
  @IsOptional()
  details?: string[];

  @ApiPropertyOptional({ description: '标签', example: ['热门', '新品', '真丝'] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: '图片URL列表', example: ['image1.jpg', 'image2.jpg'] })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ description: '评价数量', example: 28 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  reviews?: number;

  @ApiPropertyOptional({ description: '是否激活', example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: '库存数量', example: 5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;
}

export class ProductQueryDto {
  @ApiPropertyOptional({ description: '页码', example: 1 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', example: 12 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 12;

  @ApiPropertyOptional({ description: '朝代筛选', example: 'tang' })
  @IsString()
  @IsOptional()
  dynasty?: string;

  @ApiPropertyOptional({ description: '分类筛选', example: '齐胸襦裙' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: '标签筛选', example: '热门' })
  @IsString()
  @IsOptional()
  tag?: string;

  @ApiPropertyOptional({ description: '搜索关键词', example: '唐风' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: '排序方式',
    example: 'newest',
    enum: ['newest', 'popular', 'price-asc', 'price-desc'],
  })
  @IsString()
  @IsOptional()
  sort?: string = 'newest';

  @ApiPropertyOptional({ description: '最小价格', example: 50 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({ description: '最大价格', example: 100 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  maxPrice?: number;
}
