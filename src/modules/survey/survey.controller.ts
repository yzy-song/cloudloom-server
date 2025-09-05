import { Body, Controller, Post, Param, ParseIntPipe } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CreateResponseDto } from './dto/create-response.dto';

@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  /**
   * 提交问卷回答
   * @param surveyId - 目标问卷的ID
   * @param createResponseDto - 包含用户回答的数据
   */
  @Post(':surveyId/responses')
  createResponse(@Param('surveyId', ParseIntPipe) surveyId: number, @Body() createResponseDto: CreateResponseDto) {
    return this.surveyService.createResponse(surveyId, createResponseDto);
  }
}
