/*
 * @Author: yzy
 * @Date: 2025-08-19 23:09:20
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-27 23:13:03
 */
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ImageDto {
  @IsString()
  url: string;

  @IsString()
  @IsOptional()
  alt?: string;
}

class SizeOptionDto {
  @IsString()
  size: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  dynasty: string;

  @IsString()
  dynastyLabel: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @IsString()
  @IsOptional()
  material?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images: ImageDto[];

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SizeOptionDto)
  sizeOptions: SizeOptionDto[];

  @IsArray()
  details: any[];

  @IsString()
  @IsOptional()
  careInstructions?: string;

  @IsNumber()
  subcategoryId: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
