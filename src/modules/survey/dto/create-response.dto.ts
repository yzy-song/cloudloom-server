import { Type } from 'class-transformer';
import { IsString, IsArray, IsOptional, IsNumber, IsObject, ValidateNested, IsNotEmpty, IsEmail } from 'class-validator';

// 用于验证 demographics 嵌套对象
class DemographicsDto {
  @IsString()
  @IsOptional()
  age: string;

  @IsString()
  @IsOptional()
  gender: string;

  @IsString()
  @IsOptional()
  occupation: string;

  @IsString()
  @IsOptional()
  nationality: string;
}

// 完整的问卷数据DTO
export class CreateResponseDto {
  // 新增：联系方式字段
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail() // 添加邮箱格式验证
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  // --- 原有字段 ---
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  recognizedItems: string[];

  @IsString()
  @IsNotEmpty() // residence/city 是必填项
  residence: string;

  @IsString()
  @IsOptional()
  channel: string;

  @IsNumber()
  @IsOptional()
  hanfuKnowledge: number | null;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  motivation: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  desiredServices: string[];

  @IsString()
  @IsOptional()
  stylePreference: string;

  @IsString()
  @IsOptional()
  durationPreference: string;

  @IsString()
  @IsOptional()
  pricePackageA: string;

  @IsString()
  @IsOptional()
  pricePackageB: string;

  @IsString()
  @IsOptional()
  pricePackageC: string;

  @IsObject()
  @ValidateNested()
  @Type(() => DemographicsDto)
  demographics: DemographicsDto;

  @IsNumber()
  @IsOptional()
  sharingLikelihood: number | null;

  @IsString()
  @IsOptional()
  feedback: string;
}
