import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from '../../core/entities/response.entity';
import { CreateResponseDto } from './dto/create-response.dto';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Response)
    private readonly responseRepository: Repository<Response>
  ) {}

  async create(createResponseDto: CreateResponseDto): Promise<Response> {
    const newResponse = this.responseRepository.create(createResponseDto);
    return this.responseRepository.save(newResponse);
  }

  async findAll(): Promise<Response[]> {
    return this.responseRepository.find({
      order: {
        submitted_at: 'DESC',
      },
    });
  }
}
