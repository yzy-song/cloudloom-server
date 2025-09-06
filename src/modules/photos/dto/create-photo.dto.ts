import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePhotoDto {
  @ApiProperty({ description: '图片存储路径', example: 'uploads/xxx.jpg' })
  @IsString()
  url: string;
}
