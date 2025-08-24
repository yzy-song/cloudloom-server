/*
 * @Author: yzy
 * @Date: 2025-08-24 14:14:38
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-24 14:14:47
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, IsIn, Matches, IsNotEmpty, Min, Max } from 'class-validator';
import { type BookingStatus } from 'src/core/entities/booking.entity';
export class BookingQueryDto {
  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', example: 10, default: 10 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: '状态筛选',
    example: 'pending',
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
  })
  @IsString()
  @IsOptional()
  status?: BookingStatus;

  @ApiPropertyOptional({ description: '开始日期 (YYYY-MM-DD)', example: '2024-03-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期 (YYYY-MM-DD)', example: '2024-03-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: '客户姓名搜索', example: '张三' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ description: '客户邮箱搜索', example: 'zhangsan@email.com' })
  @IsString()
  @IsOptional()
  customerEmail?: string;

  @ApiPropertyOptional({ description: '预约类型筛选', example: 'standard' })
  @IsString()
  @IsOptional()
  bookingType?: string;

  @ApiPropertyOptional({ description: '按时间排序', example: 'DESC', enum: ['ASC', 'DESC'] })
  @IsString()
  @IsOptional()
  order?: 'ASC' | 'DESC' = 'DESC';
}
