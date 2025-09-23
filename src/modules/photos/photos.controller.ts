import { Controller, Post, Get, Delete, UseInterceptors, UploadedFile, Param, Request, UseGuards, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Get()
  findAll(@Query('userId') userId?: string) {
    if (userId) {
      return this.photosService.findByUser(userId).then(list => ({ data: list }));
    }
    return this.photosService.findAll().then(list => ({ data: list }));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.photosService.remove(+id, req.user.id).then(() => ({ message: '删除成功' }));
  }
}
