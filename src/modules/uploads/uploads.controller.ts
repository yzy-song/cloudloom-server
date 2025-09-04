import { Controller, Post, UseInterceptors, UploadedFiles, HttpException, HttpStatus } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('文件上传')
@Controller('uploads')
export class UploadsController {
  // 只保留这一个端点，它可以处理单文件和多文件
  @Post()
  @ApiOperation({ summary: '上传图片文件 (支持单张或批量, 最多10张)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '要上传的图片文件列表',
    schema: {
      type: 'object',
      properties: {
        // 约定前端上传时使用的字段名为 'files'
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
        // 关键改动在这里！
        // 它会优先使用环境变量 UPLOAD_DESTINATION
        // 如果环境变量不存在，它会回退到 './public/uploads'，以保证本地开发不受影响
        destination: process.env.UPLOAD_DESTINATION || './public/uploads',

        filename: (req, file, cb) => {
          // 使用 uuidv4() 生成一个标准的唯一ID
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
  uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || files.length === 0) {
      throw new HttpException('没有文件被上传', HttpStatus.BAD_REQUEST);
    }

    const response = files.map(file => ({
      url: `${file.filename}`,
    }));

    // 返回一个包含所有上传文件 URL 的数组
    return response;
  }
}
