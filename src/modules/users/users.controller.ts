/*
 * @Author: yzy
 * @Date: 2025-08-29 22:09:56
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-30 17:03:41
 */
import { Controller, Get, Post, Put, Delete, Param, Body, Query, Logger } from '@nestjs/common';
import { Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

@ApiTags('用户管理')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: '用户列表' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    this.logger.log(`GET /users 查询用户列表 page=${page}, limit=${limit}`);
    return this.usersService.findAll({ page, limit }).then(([list, total]) => ({ data: { list, total } }));
  }

  @Get(':id')
  @ApiOperation({ summary: '用户详情' })
  findOne(@Param('id') id: string) {
    this.logger.log(`GET /users/${id} 查询用户详情`);
    return this.usersService.findOne(id).then(user => ({ data: user }));
  }

  @Post()
  @ApiOperation({ summary: '新增用户' })
  create(@Body() dto: CreateUserDto) {
    this.logger.log('POST /users 新增用户', { dto });
    return this.usersService.create(dto).then(user => ({ data: user, message: '用户创建成功' }));
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑用户' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    this.logger.log(`PUT /users/${id} 编辑用户`, { dto });
    return this.usersService.update(id, dto).then(user => ({ data: user, message: '用户更新成功' }));
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  remove(@Param('id') id: string) {
    this.logger.log(`DELETE /users/${id} 删除用户`);
    return this.usersService.remove(id).then(() => ({ message: '用户删除成功' }));
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '修改个人信息' })
  async updateProfile(@Body() dto: UpdateUserDto, @Req() req: Request) {
    const userId = (req.user as any)?.id;
    this.logger.log(`PATCH /users/profile 修改个人信息 userId=${userId}`, { dto });
    return this.usersService.update(userId, dto).then(user => ({ data: user, message: '个人信息修改成功' }));
  }
}
