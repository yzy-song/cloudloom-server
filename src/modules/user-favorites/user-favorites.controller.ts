import { Controller, Post, Delete, Get, Body, Param, UseGuards, Request, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { UserFavoritesService } from './user-favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AddFavoriteDto } from './dto/add-favorite.dto';

@ApiTags('用户收藏')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user-favorites')
export class UserFavoritesController {
  constructor(private readonly userFavoritesService: UserFavoritesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '添加商品到收藏夹' })
  @ApiResponse({ status: 201, description: '收藏成功' })
  @ApiResponse({ status: 404, description: '商品或用户不存在' })
  @ApiResponse({ status: 409, description: '商品已在收藏夹中' })
  addFavorite(@Request() req, @Body() addFavoriteDto: AddFavoriteDto) {
    const userId = req.user.id;
    return this.userFavoritesService.addFavorite(userId, addFavoriteDto.productId);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '从收藏夹移除商品' })
  @ApiParam({ name: 'productId', description: '商品ID', type: 'number' })
  @ApiResponse({ status: 204, description: '取消收藏成功' })
  @ApiResponse({ status: 404, description: '收藏记录未找到' })
  removeFavorite(@Request() req, @Param('productId', ParseIntPipe) productId: number) {
    const userId = req.user.id;
    return this.userFavoritesService.removeFavorite(userId, productId);
  }

  @Get()
  @ApiOperation({ summary: '获取当前用户的收藏列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', type: 'number' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', type: 'number' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getFavorites(@Request() req, @Query('page') page: string, @Query('limit') limit: string) {
    const userId = req.user.id;
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.userFavoritesService.getFavorites(userId, pageNumber, limitNumber);
  }
}
