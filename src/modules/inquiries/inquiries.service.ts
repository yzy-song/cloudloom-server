import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquiry, InquiryStatus } from '../../core/entities/inquiry.entity';
import { CreateInquiryDto, UpdateInquiryDto, InquiryQueryDto } from './dto/create-inquiry.dto';

@Injectable()
export class InquiriesService {
  constructor(
    @InjectRepository(Inquiry)
    private inquiriesRepository: Repository<Inquiry>
  ) {}

  async create(createInquiryDto: CreateInquiryDto): Promise<Inquiry> {
    try {
      const inquiry = this.inquiriesRepository.create(createInquiryDto);
      return await this.inquiriesRepository.save(inquiry);
    } catch (error) {
      throw new BadRequestException('创建咨询失败: ' + error.message);
    }
  }

  async findAll(query: InquiryQueryDto): Promise<{ data: Inquiry[]; count: number; page: number; limit: number }> {
    const { page = 1, limit = 1, status, collaborationType } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.inquiriesRepository.createQueryBuilder('inquiry');

    // 添加筛选条件
    if (status) {
      queryBuilder.andWhere('inquiry.status = :status', { status });
    }

    if (collaborationType) {
      queryBuilder.andWhere('inquiry.collaborationType = :collaborationType', { collaborationType });
    }

    // 按时间倒序排列
    queryBuilder.orderBy('inquiry.createdAt', 'DESC');

    // 获取总数
    const total = await queryBuilder.getCount();

    // 添加分页
    queryBuilder.skip(skip).take(limit);

    const data = await queryBuilder.getMany();

    return {
      data,
      count: total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Inquiry> {
    const inquiry = await this.inquiriesRepository.findOne({ where: { id } });

    if (!inquiry) {
      throw new NotFoundException(`咨询 #${id} 未找到`);
    }

    return inquiry;
  }

  async update(id: number, updateInquiryDto: UpdateInquiryDto): Promise<Inquiry> {
    const inquiry = await this.inquiriesRepository.findOne({ where: { id } });

    if (!inquiry) {
      throw new NotFoundException(`咨询 #${id} 未找到`);
    }

    try {
      // **修复方案**：在 merge 之前进行类型转换
      // 如果 status 存在且是字符串，转换为枚举
      if (updateInquiryDto.status && typeof updateInquiryDto.status === 'string') {
        // 使用类型断言确保类型匹配
        updateInquiryDto.status = updateInquiryDto.status as InquiryStatus;
      }

      const updatedInquiry = this.inquiriesRepository.merge(inquiry, updateInquiryDto);
      return await this.inquiriesRepository.save(updatedInquiry);
    } catch (error) {
      throw new BadRequestException('更新咨询失败: ' + error.message);
    }
  }

  async remove(id: number): Promise<void> {
    const result = await this.inquiriesRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`咨询 #${id} 未找到`);
    }
  }

  async getStats(): Promise<{
    total: number;
    new: number;
    contacted: number;
    resolved: number;
    byCollaborationType: Record<number, number>;
  }> {
    // 获取状态统计
    const statusStats = await this.inquiriesRepository.createQueryBuilder('inquiry').select('inquiry.status', 'status').addSelect('COUNT(*)', 'count').groupBy('inquiry.status').getRawMany();

    // 获取合作类型统计
    const typeStats = await this.inquiriesRepository.createQueryBuilder('inquiry').select('inquiry.collaborationType', 'type').addSelect('COUNT(*)', 'count').groupBy('inquiry.collaborationType').getRawMany();

    const result = {
      total: 0,
      new: 0,
      contacted: 0,
      resolved: 0,
      byCollaborationType: {},
    };

    // 处理状态统计
    statusStats.forEach(stat => {
      const count = parseInt(stat.count);
      result.total += count;
      result[stat.status] = count;
    });

    // 处理类型统计
    typeStats.forEach(stat => {
      result.byCollaborationType[stat.type] = parseInt(stat.count);
    });

    return result;
  }

  async markAsContacted(id: number): Promise<Inquiry> {
    return this.update(id, { status: 'contacted' });
  }

  async markAsResolved(id: number): Promise<Inquiry> {
    return this.update(id, { status: 'resolved' });
  }
}
