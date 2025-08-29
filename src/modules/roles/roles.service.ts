import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../../core/entities/role.entity';
import { Repository } from 'typeorm';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>
  ) {}

  async findAll() {
    return this.roleRepo.find();
  }

  async findOne(id: number) {
    return this.roleRepo.findOne({ where: { id } });
  }

  async create(dto: CreateRoleDto) {
    const role = this.roleRepo.create(dto);
    return this.roleRepo.save(role);
  }

  async update(id: number, dto: UpdateRoleDto) {
    await this.roleRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.roleRepo.delete(id);
  }
}
