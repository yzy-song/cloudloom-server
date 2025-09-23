import { Controller, Post, UseInterceptors, UploadedFiles, HttpException, HttpStatus, Inject, Req, UseGuards } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { ConfigService } from '@nestjs/config';

@ApiTags('文件上传')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}
  /**
   * 通用上传接口，根据不同type将图片存储到不同子目录
   * RESTful风格：/uploads/products, /uploads/avatars, /uploads/banners, /uploads/photowall
   */
  @Post(':type')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '按类型上传图片文件 (支持单张或批量, 最多10张)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '要上传的图片文件列表',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '文件上传成功',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: { url: { type: 'string' } },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const typeMap = {
            products: 'img-products',
            avatars: 'img-avatars',
            banners: 'img-banners',
            photowall: 'img-photowall',
          };
          const type = req.params.type;
          const subDir = typeMap[type];
          if (!subDir) {
            return cb(new HttpException('不支持的图片类型', HttpStatus.BAD_REQUEST), '');
          }
          const uploadRoot = process.env.UPLOAD_DESTINATION || './public/uploads';
          const dest = `${uploadRoot}/${subDir}`;
          const fs = require('fs');
          if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
          }
          cb(null, dest);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          const fileExtName = extname(file.originalname);
          cb(null, `${uniqueSuffix}${fileExtName}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new HttpException('仅支持上传图片文件!', HttpStatus.BAD_REQUEST), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 1024 * 1024 * 20, // 每个文件 20 MB
      },
    })
  )
  uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>, @Req() req): any {
    const type = req.params.type;
    const userId = req.user?.id;
    if (!files || files.length === 0) {
      throw new HttpException('没有文件被上传', HttpStatus.BAD_REQUEST);
    }
    // 调用 service 处理业务逻辑，传递 userId
    return this.uploadsService.handleUpload(files, type, userId);
  }
}
