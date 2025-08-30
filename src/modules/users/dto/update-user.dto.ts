/*
 * @Author: yzy
 * @Date: 2025-08-29 20:57:34
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-30 17:14:17
 */
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional()
  username?: string;

  @ApiPropertyOptional()
  avatar?: string;

  @ApiPropertyOptional()
  nickname?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  password?: string;

  @ApiPropertyOptional({ description: '个人简介', example: '这个人很懒，什么都没有写' })
  description?: string;
}
