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

  /**
   * 创建一个新的问卷回答，并将其关联到指定的问卷
   * @param surveyId - 目标问卷的ID
   * @param createResponseDto - 包含用户回答的数据
   * @returns 创建的 Response 实体
   */
  async createResponse(surveyId: number, createResponseDto: CreateResponseDto): Promise<Response> {
    const { name, email, phone, residence, demographics, ...answers } = createResponseDto;
    const { age, gender } = demographics;

    // 步骤 1: 验证目标问卷是否存在
    const survey = await this.surveyRepository.findOne({ where: { id: surveyId } });
    if (!survey) {
      // 如果找不到问卷，则抛出 404 错误
      throw new NotFoundException(`Survey with ID ${surveyId} not found`);
    }

    // 步骤 2: 使用动态的 surveyId 创建新的 response 实体
    const newResponse = this.responseRepository.create({
      survey_id: surveyId, // 使用从 URL 传入的 surveyId
      name,
      email,
      phone,
      city: residence,
      age,
      gender,
      answers, // 将剩余的所有问卷问题答案存入 JSON 字段
    });

    // 步骤 3: 保存并返回新的 response
    return this.responseRepository.save(newResponse);
  }
}
