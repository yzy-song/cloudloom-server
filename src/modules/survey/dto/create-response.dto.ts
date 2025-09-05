import { Type } from 'class-transformer';
import { IsString, IsArray, IsOptional, IsNumber, IsObject, ValidateNested, IsNotEmpty } from 'class-validator';

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

// 用于验证 answers 核心对象
class SurveyAnswersDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  recognizedItems: string[];

  @IsString()
  @IsOptional()
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

// 最外层的 DTO
export class CreateResponseDto {
  @IsObject()
  @ValidateNested()
  @Type(() => SurveyAnswersDto)
  @IsNotEmpty()
  answers: SurveyAnswersDto;
}
