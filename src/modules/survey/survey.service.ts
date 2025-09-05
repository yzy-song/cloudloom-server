import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from 'src/core/entities/survey.entity';
import { Response } from 'src/core/entities/response.entity';
import { CreateResponseDto } from './dto/create-response.dto';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRepository: Repository<Survey>,
    @InjectRepository(Response)
    private readonly responseRepository: Repository<Response>
  ) {}

  async createResponse(createResponseDto: CreateResponseDto) {
    // 假设我们总是将回复关联到 ID 为 1 的调查问卷
    // 在实际应用中，这个 ID 可能是动态的
    const surveyId = 1;
    const survey = await this.surveyRepository.findOneBy({ id: surveyId });

    if (!survey) {
      throw new NotFoundException(`Survey with ID "${surveyId}" not found`);
    }

    const newResponse = this.responseRepository.create({
      answers: createResponseDto.answers,
      survey: survey, // 关联到找到的问卷
      // 如果需要，也可以关联用户
      // user: ...
    });

    return this.responseRepository.save(newResponse);
  }

  // (保留) 获取所有问卷的逻辑
  findAllSurveys() {
    return this.surveyRepository.find();
  }
}
