import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveyController } from './survey.controller';
import { SurveyService } from './survey.service';
import { Response } from '../../core/entities/response.entity';
import { Survey } from '../../core/entities/survey.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Response, Survey])],
  controllers: [SurveyController],
  providers: [SurveyService],
})
export class SurveyModule {}
