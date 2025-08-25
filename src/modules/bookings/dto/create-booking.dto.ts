import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, IsIn, Matches, IsNotEmpty, Min, Max } from 'class-validator';
import { type BookingStatus } from 'src/core/entities/booking.entity';

/**
 * 创建预约请求体
 */
export class CreateBookingDto {
  @ApiProperty({ description: '客户姓名', example: '张三' })
  @IsString()
  @IsNotEmpty()
  customerFullname: string;

  @ApiProperty({ description: '联系方式（邮箱）', example: 'zhangsan@email.com' })
  @IsString()
  @IsNotEmpty()
  customerEmail: string;

  @ApiPropertyOptional({ description: '电话号码', example: '+353 123456789' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional({ description: '产品ID', example: 1 })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiProperty({ description: '预约日期 (YYYY-MM-DD)', example: '2024-03-15' })
  @IsDateString()
  bookingDate: string;

  @ApiProperty({ description: '开始时间 (HH:MM)', example: '10:00' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  bookingTime: string;

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
    description: '预约类型',
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

/**
 * 更新预约请求体（所有字段可选）
 */
export class UpdateBookingDto extends PartialType(CreateBookingDto) {
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
  totalAmount?: number;

  @ApiPropertyOptional({
    description: '状态',
    example: 'confirmed',
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
  })
  @IsOptional()
  status?: BookingStatus;
}
