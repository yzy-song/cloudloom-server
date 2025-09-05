import { Type } from 'class-transformer';
import { IsString, IsArray, IsOptional, IsNumber, IsObject, ValidateNested, IsNotEmpty, IsEmail } from 'class-validator';

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

export class CreateResponseDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  recognizedItems: string[];

  @IsString()
  @IsNotEmpty()
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

  // 新增的业务问题字段
  @IsString()
  @IsOptional()
  partyInterest?: string;

  @IsString()
  @IsOptional()
  ownershipPreference?: string;

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
