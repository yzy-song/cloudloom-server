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
    const surveyId = 1;
    const survey = await this.surveyRepository.findOneBy({ id: surveyId });

    if (!survey) {
      throw new NotFoundException(`Survey with ID "${surveyId}" not found`);
    }

    const newResponse = this.responseRepository.create({
      survey: survey,

      // 映射到独立列，用于高效查询和联系
      city: createResponseDto.residence,
      age: createResponseDto.demographics.age,
      gender: createResponseDto.demographics.gender,
      name: createResponseDto.name, // 新增
      email: createResponseDto.email, // 新增
      phone: createResponseDto.phone, // 新增

      // 将完整的原始问卷数据存入 answers JSONB 字段，用于完整性备份
      answers: createResponseDto,
    });

    return this.responseRepository.save(newResponse);
  }

  findAllSurveys() {
    return this.surveyRepository.find();
  }
}
