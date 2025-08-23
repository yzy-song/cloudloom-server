/*
 * @Author: yzy
 * @Date: 2025-08-23 04:37:00
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-23 06:51:09
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import type { ApplicationStatus } from '../../../core/entities/collaboration-application.entity';
import { CreateCollaborationApplicationDto } from './create-collaboration-application.dto';

export class UpdateCollaborationApplicationDto extends PartialType(CreateCollaborationApplicationDto) {
  @ApiPropertyOptional({
    description: '状态',
    example: 'contacted',
    enum: ['new', 'contacted', 'resolved'],
  })
  @IsEnum(['new', 'contacted', 'resolved'] as const)
  @IsOptional()
  status?: ApplicationStatus;
}

export class CollaborationApplicationQueryDto {
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
  status?: ApplicationStatus;

  @ApiPropertyOptional({ description: '合作类型筛选', example: 1 })
  @IsNumber()
  @IsOptional()
  collaborationType?: number;
}
