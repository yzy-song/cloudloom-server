import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual, In, ILike } from 'typeorm';
import { CollaborationApplication, ApplicationStatus } from '../../core/entities/collaboration-application.entity';
import { CreateCollaborationApplicationDto } from './dto/create-collaboration-application.dto';
import { UpdateCollaborationApplicationDto, CollaborationApplicationQueryDto } from './dto/update-collaboration-application.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CollaborationApplicationsService {
  constructor(
    @InjectRepository(CollaborationApplication)
    private collaborationRepository: Repository<CollaborationApplication>,
    private notificationsService: NotificationsService
  ) {}

  async create(createDto: CreateCollaborationApplicationDto): Promise<CollaborationApplication> {
    try {
      const application = this.collaborationRepository.create(createDto);
      const savedApplication = await this.collaborationRepository.save(application);

      // 发送邮件通知管理员
      this.notificationsService.sendNewCollaborationNotification(savedApplication);

      return savedApplication;
    } catch (error) {
      throw new BadRequestException('创建合作申请失败: ' + error.message);
    }
  }

  async findAll(query: CollaborationApplicationQueryDto): Promise<{ data: CollaborationApplication[]; count: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status, collaborationType } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.collaborationRepository.createQueryBuilder('application');

    if (status) {
      queryBuilder.andWhere('application.status = :status', { status });
    }

    if (collaborationType) {
      queryBuilder.andWhere('application.collaborationType = :collaborationType', { collaborationType });
    }

    const [data, count] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      count,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<CollaborationApplication> {
    const application = await this.collaborationRepository.findOne({ where: { id } });

    if (!application) {
      throw new NotFoundException(`合作申请 #${id} 未找到`);
    }
    return application;
  }

  async update(id: string, updateDto: UpdateCollaborationApplicationDto): Promise<CollaborationApplication> {
    const application = await this.collaborationRepository.findOne({ where: { id } });
    if (!application) {
      throw new NotFoundException(`合作申请 #${id} 未找到`);
    }

    this.collaborationRepository.merge(application, updateDto);
    return this.collaborationRepository.save(application);
  }

  async remove(id: string): Promise<void> {
    const result = await this.collaborationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`合作申请 #${id} 未找到`);
    }
  }

  async markAsContacted(id: string): Promise<CollaborationApplication> {
    const application = await this.collaborationRepository.findOne({ where: { id } });
    if (!application) {
      throw new NotFoundException(`合作申请 #${id} 未找到`);
    }
    application.status = 'contacted';
    return this.collaborationRepository.save(application);
  }

  async markAsResolved(id: string): Promise<CollaborationApplication> {
    const application = await this.collaborationRepository.findOne({ where: { id } });
    if (!application) {
      throw new NotFoundException(`合作申请 #${id} 未找到`);
    }
    application.status = 'pending';
    return this.collaborationRepository.save(application);
  }

  async getStats(): Promise<{
    total: number;
    new: number;
    contacted: number;
    resolved: number;
    byCollaborationType: Record<number, number>;
  }> {
    const statusStats = await this.collaborationRepository.createQueryBuilder('application').select('application.status', 'status').addSelect('COUNT(*)', 'count').groupBy('application.status').getRawMany();

    const typeStats = await this.collaborationRepository.createQueryBuilder('application').select('application.collaborationType', 'type').addSelect('COUNT(*)', 'count').groupBy('application.collaborationType').getRawMany();

    const result = {
      total: 0,
      new: 0,
      contacted: 0,
      resolved: 0,
      byCollaborationType: {},
    };

    statusStats.forEach(stat => {
      const count = parseInt(stat.count);
      result.total += count;
      result[stat.status] = count;
    });

    typeStats.forEach(stat => {
      result.byCollaborationType[stat.type] = parseInt(stat.count);
    });

    return result;
  }
}
