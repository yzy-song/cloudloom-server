import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveyService } from './survey.service';
import { SurveyController } from './survey.controller';
import { Survey } from 'src/core/entities/survey.entity';
import { Response } from 'src/core/entities/response.entity'; // 引入 Response 实体

@Module({
  imports: [TypeOrmModule.forFeature([Survey, Response])], // 将 Response 添加到 forFeature 数组中
  controllers: [SurveyController],
  providers: [SurveyService],
})
export class SurveyModule {}
