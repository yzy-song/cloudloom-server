import { IsString, IsEmail, IsObject, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateResponseDto {
  @IsString()
  @IsNotEmpty()
  survey_id: string;

  @IsString()
  @IsOptional()
  user_id?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsObject()
  @IsNotEmpty()
  answers: object;
}
