/*
 * @Author: yzy
 * @Date: 2025-08-29 20:57:34
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-29 20:58:07
 */
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional()
  username?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  password?: string;
}
