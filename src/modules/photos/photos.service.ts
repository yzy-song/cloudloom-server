import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from '../../core/entities/photo.entity';
import { User } from '../../core/entities/user.entity';

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(Photo)
    private photosRepository: Repository<Photo>,
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(url: string, userId: string): Promise<Photo> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    const photo = this.photosRepository.create({ url, user });
    return this.photosRepository.save(photo);
  }

  findAll(): Promise<Photo[]> {
    return this.photosRepository.find({ relations: ['user'] });
  }

  findByUser(userId: string): Promise<Photo[]> {
    return this.photosRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async remove(id: number, userId: string): Promise<void> {
    const photo = await this.photosRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!photo) {
      throw new UnauthorizedException('照片不存在');
    }
    if (!photo.user || photo.user.id !== userId) {
      throw new UnauthorizedException('无权操作');
    }
    await this.photosRepository.delete(id);
  }
}
