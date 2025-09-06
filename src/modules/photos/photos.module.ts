import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Photo } from '../../core/entities/photo.entity';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';
import { User } from '../../core/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Photo, User])],
  controllers: [PhotosController],
  providers: [PhotosService],
})
export class PhotosModule {}
