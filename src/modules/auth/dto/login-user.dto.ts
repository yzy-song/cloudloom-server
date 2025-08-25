/*
 * 用户登录请求体
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    description: '邮箱或用户名',
    example: 'test@example.com 或 username123',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  identifier: string; // 支持邮箱或用户名登录

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
