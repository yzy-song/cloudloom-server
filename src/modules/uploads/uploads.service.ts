import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import * as fs from 'fs';
import { PhotosService } from '../photos/photos.service';

@Injectable()
export class UploadsService {
  constructor(
    @Inject(forwardRef(() => PhotosService))
    private readonly photosService: PhotosService
  ) {}

  async handleUpload(files: Array<Express.Multer.File>, type: string, userId?: string) {
    const typeMap = {
      products: 'img-products',
      avatars: 'img-avatars',
      banners: 'img-banners',
      photowall: 'img-photowall',
    };
    const subDir = typeMap[type];
    if (!subDir) {
      throw new HttpException('不支持的图片类型', HttpStatus.BAD_REQUEST);
    }
    const uploadRoot = process.env.UPLOAD_DESTINATION || './public/uploads';
    const dest = `${uploadRoot}/${subDir}`;
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    // 重新命名并移动文件
    const data: Array<{ path: string }> = [];
    for (const file of files) {
      const uniqueSuffix = uuidv4();
      const fileExtName = extname(file.originalname);
      const newFilename = `${uniqueSuffix}${fileExtName}`;
      const newPath = `${dest}/${newFilename}`;
      fs.renameSync(file.path, newPath);
      const relativePath = `${subDir}/${newFilename}`;
      data.push({ path: relativePath });
      // 仅 photowall 类型插入数据库
      if (type === 'photowall' && userId) {
        await this.photosService.create(relativePath, userId);
      }
    }
    return { data, message: '上传成功' };
  }
}
