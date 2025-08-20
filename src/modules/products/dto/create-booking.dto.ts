import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, IsEnum, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ description: '客户姓名', example: '张三' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ description: '联系方式', example: 'zhangsan@email.com' })
  @IsString()
  @IsNotEmpty()
  contactInfo: string;

  @ApiProperty({ description: '产品ID', example: 1 })
  @IsNumber()
  productId: number;

  @ApiProperty({ description: '选择尺寸', example: 'M' })
  @IsString()
  @IsNotEmpty()
  selectedSize: string;

  @ApiProperty({ description: '预约日期 (YYYY-MM-DD)', example: '2024-03-15' })
  @IsDateString()
  bookingDate: string;

  @ApiProperty({ description: '时间段', example: '10:00 - 11:30' })
  @IsString()
  @IsNotEmpty()
  timeSlot: string;

  @ApiPropertyOptional({ description: '备注', example: '需要儿童尺寸' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: '总价格', example: 89.99 })
  @IsNumber()
  totalPrice: number;
}

export class UpdateBookingDto {
  @ApiPropertyOptional({ description: '客户姓名', example: '张三' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ description: '联系方式', example: 'zhangsan@email.com' })
  @IsString()
  @IsOptional()
  contactInfo?: string;

  @ApiPropertyOptional({ description: '产品ID', example: 1 })
  @IsNumber()
  @IsOptional()
  productId?: number;

  @ApiPropertyOptional({ description: '选择尺寸', example: 'M' })
  @IsString()
  @IsOptional()
  selectedSize?: string;

  @ApiPropertyOptional({ description: '预约日期 (YYYY-MM-DD)', example: '2024-03-15' })
  @IsDateString()
  @IsOptional()
  bookingDate?: string;

  @ApiPropertyOptional({ description: '时间段', example: '10:00 - 11:30' })
  @IsString()
  @IsOptional()
  timeSlot?: string;

  @ApiPropertyOptional({ description: '备注', example: '需要儿童尺寸' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: '总价格', example: 89.99 })
  @IsNumber()
  @IsOptional()
  totalPrice?: number;

  @ApiPropertyOptional({
    description: '状态',
    example: 'confirmed',
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
  })
  @IsString()
  @IsOptional()
  status?: string;
}

export class BookingQueryDto {
  @ApiPropertyOptional({ description: '页码', example: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', example: 10 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ description: '状态筛选', example: 'pending' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: '日期筛选 (YYYY-MM-DD)', example: '2024-03-15' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ description: '客户姓名搜索', example: '张三' })
  @IsString()
  @IsOptional()
  customer?: string;
}
