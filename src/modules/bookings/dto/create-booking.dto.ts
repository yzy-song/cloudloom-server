import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, IsIn, IsEnum, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ description: '客户姓名', example: '张三' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: '联系方式', example: 'zhangsan@email.com' })
  @IsString()
  @IsNotEmpty()
  contactInfo: string;

  @ApiPropertyOptional({ description: '电话号码', example: '+353 123456789' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '产品ID（标准预约时需要）', example: 1 })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiProperty({ description: '预约日期 (YYYY-MM-DD)', example: '2024-03-15' })
  @IsDateString()
  bookingDate: string;

  @ApiProperty({ description: '时间段', example: '10:00 - 11:30' })
  @IsString()
  @IsNotEmpty()
  timeSlot: string;

  @ApiProperty({ description: '参与人数', example: 2 })
  @IsNumber()
  participants: number;

  @ApiProperty({ description: '总价格', example: 89.99 })
  @IsNumber()
  totalAmount: number;

  @ApiPropertyOptional({ description: '备注', example: '需要儿童尺寸' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: '预约类型 (standard-标准预约, time_slot_only-时段预留)',
    example: 'standard',
    default: 'standard',
  })
  @IsOptional()
  @IsIn(['standard', 'time_slot_only'])
  bookingType?: string;

  @ApiPropertyOptional({ description: '紧急联系人', example: '李四 +353 987654321' })
  @IsOptional()
  @IsString()
  emergencyContact?: string;
}

export class UpdateBookingDto {
  @ApiPropertyOptional({ description: '客户姓名', example: '张三' })
  @IsString()
  @IsOptional()
  fullName?: string;

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
  bookingDate: string;

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
