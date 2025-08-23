/*
 * @Author: yzy
 * @Date: 2025-08-23 03:56:41
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-23 17:52:51
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, MinLength, MaxLength } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ description: '用户名', example: 'testuser' })
  @IsString()
  @MinLength(3, { message: '用户名至少需要3个字符' })
  @MaxLength(50, { message: '用户名不能超过50个字符' })
  username: string;

  @ApiProperty({ description: '头像' })
  @IsString()
  avatarUrl: string;

  @ApiProperty({ description: '邮箱', example: 'test@example.com' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: '密码至少需要6个字符' })
  @MaxLength(50, { message: '密码不能超过50个字符' })
  password: string;

  @ApiPropertyOptional({ description: '电话', required: false })
  @IsString()
  @MaxLength(50)
  phone?: string;
}
