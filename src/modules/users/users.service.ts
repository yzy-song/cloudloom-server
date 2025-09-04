import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../core/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto';
import { AppLogger } from '../../utils/logger';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext(UsersService.name);
  }

  async findAll({ page, limit }) {
    this.logger.log(`查询用户列表 page=${page}, limit=${limit}`);
    return this.userRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    this.logger.log(`查询用户详情 id=${id}`);
    return this.userRepo.findOne({ where: { id } });
  }

  async create(dto: CreateUserDto) {
    this.logger.log('创建用户', { dto });
    const user = this.userRepo.create(dto);
    try {
      const saved = await this.userRepo.save(user);
      this.logger.log('用户创建成功', { id: saved.id });
      return saved;
    } catch (error) {
      this.logger.error('用户创建失败', error?.stack, { dto });
      throw error;
    }
  }

  async update(id: string, dto: UpdateUserDto) {
    this.logger.log(`更新用户 id=${id}`, { dto });
    try {
      await this.userRepo.update(id, dto);
      this.logger.log('用户更新成功', { id });
      return this.findOne(id);
    } catch (error) {
      this.logger.error('用户更新失败', error?.stack, { id, dto });
      throw error;
    }
  }

  // 修改个人信息（如有特殊逻辑可单独实现）
  async updateProfile(id: string, dto: UpdateUserDto) {
    this.logger.log(`修改个人信息 id=${id}`, { dto });
    // 可在此添加额外校验
    return this.update(id, dto);
  }

  async remove(id: string) {
    this.logger.log(`从db永久删除用户 id=${id}`);
    try {
      const result = await this.userRepo.delete(id);
      this.logger.log('用户删除成功', { id });
      return result;
    } catch (error) {
      this.logger.error('用户删除失败', error?.stack, { id });
      throw error;
    }
  }
}
