import { Controller, Post, UseInterceptors, UploadedFiles, HttpException, HttpStatus, Inject, Req } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
// import { ConfigService } from '@nestjs/config';

@ApiTags('文件上传')
@Controller('uploads')
export class UploadsController {
  // constructor(private readonly configService: ConfigService) {}
  /**
   * 通用上传接口，根据不同type将图片存储到不同子目录
   * RESTful风格：/uploads/products, /uploads/avatars, /uploads/banners, /uploads/photowall
   */
  @Post(':type')
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
          // 读取环境变量UPLOAD_DESTINATION，默认'./public/uploads'
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
        fileSize: 1024 * 1024 * 5, // 每个文件 5 MB
      },
    })
  )
  uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>, @Req() req): any {
    if (!files || files.length === 0) {
      throw new HttpException('没有文件被上传', HttpStatus.BAD_REQUEST);
    }
    // 返回带相对路径的url
    const typeMap = {
      products: 'img-products',
      avatars: 'img-avatars',
      banners: 'img-banners',
      photowall: 'img-photowall',
    };
    const type = req.params.type;
    const subDir = typeMap[type];
    const response = files.map(file => ({
      path: `${subDir}/${file.filename}`, // 只返回相对路径
    }));
    return response;
  }
}
