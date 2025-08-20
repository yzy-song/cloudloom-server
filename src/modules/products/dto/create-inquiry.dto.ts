/*
 * @Author: yzy
 * @Date: 2025-08-19 23:11:56
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-20 13:22:38
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsNotEmpty, IsEnum, Min, Max } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import type { InquiryStatus } from '../../../core/entities/inquiry.entity';
export class CreateInquiryDto {
  @ApiProperty({ description: '姓名', example: '李四' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '联系方式', example: 'lisi@company.com' })
  @IsString()
  @IsNotEmpty()
  contact: string;

  @ApiPropertyOptional({ description: '公司/机构', example: '某某文化公司' })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiProperty({ description: '合作类型', example: 1 })
  @IsNumber()
  collaborationType: number;

  @ApiProperty({ description: '咨询消息', example: '我们想与贵馆建立长期合作关系...' })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class UpdateInquiryDto extends PartialType(CreateInquiryDto) {
  @ApiPropertyOptional({ description: '姓名', example: '李四' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '联系方式', example: 'lisi@company.com' })
  @IsString()
  @IsOptional()
  contact?: string;

  @ApiPropertyOptional({ description: '公司/机构', example: '某某文化公司' })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiPropertyOptional({ description: '合作类型', example: 1 })
  @IsNumber()
  @IsOptional()
  collaborationType?: number;

  @ApiPropertyOptional({ description: '咨询消息', example: '我们想与贵馆建立长期合作关系...' })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiPropertyOptional({
    description: '状态',
    example: 'contacted',
    enum: ['new', 'contacted', 'resolved'],
  })
  @IsOptional()
  @IsEnum(['new', 'contacted', 'resolved'] as const)
  status?: InquiryStatus;
}

export class InquiryQueryDto {
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

  @ApiPropertyOptional({ description: '状态筛选', example: 'new' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: '合作类型筛选', example: 1 })
  @IsNumber()
  @IsOptional()
  collaborationType?: number;
}
