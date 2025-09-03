import { Controller, Get, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CreateResponseDto } from './dto/create-response.dto';

@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post('responses')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(@Body() createResponseDto: CreateResponseDto) {
    return this.surveyService.create(createResponseDto);
  }

  @Get('responses')
  findAll() {
    return this.surveyService.findAll();
  }
}
