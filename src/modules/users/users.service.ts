import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../core/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) {}

  async findAll({ page, limit }) {
    return this.userRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }

  async create(dto: CreateUserDto) {
    const user = this.userRepo.create(dto);
    try {
      const saved = await this.userRepo.save(user);
      return saved;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, dto: UpdateUserDto) {
    try {
      await this.userRepo.update(id, dto);
      return this.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  // 修改个人信息（如有特殊逻辑可单独实现）
  async updateProfile(id: string, dto: UpdateUserDto) {
    // 可在此添加额外校验
    return this.update(id, dto);
  }

  async remove(id: string) {
    try {
      const result = await this.userRepo.delete(id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
