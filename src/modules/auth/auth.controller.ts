/*
 * @Author: yzy
 * @Date: 2025-08-23 03:56:13
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-23 05:42:32
 */
import { Controller, Post, Body, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from '../../core/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功', type: User })
  @ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
  async register(@Body() registerUserDto: RegisterUserDto): Promise<User> {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    schema: {
      properties: {
        accessToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '无效的凭证' })
  async login(@Body() loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    return this.authService.login(loginUserDto);
  }
}
