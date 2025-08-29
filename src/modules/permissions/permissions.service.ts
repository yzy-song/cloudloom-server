import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '../../core/entities/permission.entity';
import { Repository } from 'typeorm';
import { CreatePermissionDto, UpdatePermissionDto } from './dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>
  ) {}

  async findAll() {
    return this.permissionRepo.find();
  }

  async findOne(id: number) {
    return this.permissionRepo.findOne({ where: { id } });
  }

  async create(dto: CreatePermissionDto) {
    const permission = this.permissionRepo.create(dto);
    return this.permissionRepo.save(permission);
  }

  async update(id: number, dto: UpdatePermissionDto) {
    await this.permissionRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.permissionRepo.delete(id);
  }
}
