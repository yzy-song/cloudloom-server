/*
 * @Author: yzy
 * @Date: 2025-08-23 03:56:51
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-23 06:16:44
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
  identifier: string; // Changed from email to identifier

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
