import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: '分类名称', example: '齐胸襦裙' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: '分类描述', required: false, example: '一种高腰的汉服，常见于唐朝' })
  @IsString()
  @IsOptional()
  desc?: string;
}
