import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from '../../core/entities/photo.entity';
import { User } from '../../core/entities/user.entity';

@Injectable()
export class PhotosService {
  private readonly logger = new Logger(PhotosService.name);
  constructor(
    @InjectRepository(Photo)
    private photosRepository: Repository<Photo>,
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  findAll(): Promise<Photo[]> {
    this.logger.log('查询所有照片');
    return this.photosRepository.find({ relations: ['user'] });
  }

  async create(url: string, userId: string): Promise<Photo> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException('User not exist');
    }
    const photo = this.photosRepository.create({ url, user });
    return this.photosRepository.save(photo);
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
      throw new UnauthorizedException('Photo not exist');
    }
    if (!photo.user || photo.user.id !== userId) {
      throw new UnauthorizedException('Operation not permitted');
    }
    await this.photosRepository.delete(id);
  }
}
