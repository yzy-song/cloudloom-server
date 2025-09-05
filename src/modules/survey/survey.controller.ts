import { Controller, Get, Post, Body } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CreateResponseDto } from './dto/create-response.dto';

@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post('responses') // 定义接口路径为 POST /survey/responses
  create(@Body() createResponseDto: CreateResponseDto) {
    return this.surveyService.createResponse(createResponseDto);
  }

  @Get()
  findAll() {
    return this.surveyService.findAllSurveys();
  }
}
