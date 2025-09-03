/*
 * @Author: yzy
 * @Date: 2025-08-23 03:56:13
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-27 21:11:11
 */
import { Controller, Post, Body, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AppLogger } from '../../utils/logger';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from '../../core/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { OAuthLoginDto } from './dto/oauth-login.dto';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext(AuthController.name);
  }

  @Post('register')
  @ApiOperation({ summary: '用户注册', description: '注册新用户，返回用户信息' })
  @ApiResponse({ status: 201, description: '注册成功', type: User })
  @ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
  async register(@Body() registerUserDto: RegisterUserDto): Promise<User> {
    this.logger.log('POST /auth/register 用户注册', { registerUserDto });
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录', description: '登录成功后返回JWT令牌' })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    schema: {
      properties: {
        accessToken: { type: 'string', description: 'JWT 访问令牌' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '无效的凭证' })
  async login(@Body() loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    this.logger.log('POST /auth/login 用户登录', { loginUserDto });
    return this.authService.login(loginUserDto);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '用户登出', description: '将当前JWT加入黑名单，实现登出' })
  @ApiResponse({ status: 200, description: '成功登出' })
  async logout(@Request() req) {
    const token = req.headers.authorization?.split(' ')[1];
    this.logger.log('POST /auth/logout 用户登出', { token });
    // 将token加入黑名单（存储到Redis或数据库中）
    await this.authService.addToBlacklist(token);
    return { message: '成功登出' };
  }

  @Post('oauth-login')
  @ApiOperation({ summary: '第三方登录（Firebase）', description: '第三方登录，首次自动注册' })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    schema: {
      properties: {
        accessToken: { type: 'string', description: 'JWT 访问令牌' },
        user: { $ref: '#/components/schemas/User' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '无效的 token' })
  async oauthLogin(@Body() dto: OAuthLoginDto): Promise<{ accessToken: string; user: User }> {
    this.logger.log('POST /auth/oauth-login 第三方登录', { dto });
    return this.authService.oauthLogin(dto);
  }
}
