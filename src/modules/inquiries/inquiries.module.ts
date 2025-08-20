/*
 * @Author: yzy
 * @Date: 2025-08-20 10:46:49
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-20 10:46:56
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InquiriesService } from './inquiries.service';
import { InquiriesController } from './inquiries.controller';
import { Inquiry } from '../../core/entities/inquiry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inquiry])],
  controllers: [InquiriesController],
  providers: [InquiriesService],
  exports: [InquiriesService],
})
export class InquiriesModule {}
