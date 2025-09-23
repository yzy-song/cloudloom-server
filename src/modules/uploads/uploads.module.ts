import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { ConfigModule } from '@nestjs/config';
import { PhotosModule } from '../photos/photos.module';

@Module({
  imports: [ConfigModule, PhotosModule],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
