/*
 * @Author: yzy
 * @Date: 2025-08-20 11:09:13
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-23 08:24:36
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCollaborationApplicationDto {
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

  @ApiProperty({ description: '合作类型', example: '渠道合作' })
  @IsString()
  @IsNotEmpty()
  collaborationType: string;

  @ApiProperty({ description: '咨询消息', example: '我们想与贵馆建立长期合作关系...' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
