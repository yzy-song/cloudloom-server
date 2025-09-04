import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFavorite } from '../../core/entities/user-favorite.entity';
import { Product } from '../../core/entities/product.entity';
import { User } from '../../core/entities/user.entity';
import { AppLogger } from '../../utils/logger';

@Injectable()
export class UserFavoritesService {
  constructor(
    @InjectRepository(UserFavorite)
    private readonly userFavoriteRepository: Repository<UserFavorite>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext(UserFavoritesService.name);
  }

  async addFavorite(userId: string, productId: number): Promise<UserFavorite> {
    this.logger.log(`用户 ${userId} 尝试收藏商品 ${productId}`);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`用户ID ${userId} 不存在`);
    }

    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`商品ID ${productId} 不存在`);
    }

    const existingFavorite = await this.userFavoriteRepository.findOne({
      where: { userId, productId },
    });

    if (existingFavorite) {
      throw new ConflictException('该商品已在收藏夹中');
    }

    const favorite = this.userFavoriteRepository.create({ userId, productId });
    try {
      const saved = await this.userFavoriteRepository.save(favorite);
      this.logger.log(`用户 ${userId} 成功收藏商品 ${productId}`);
      return saved;
    } catch (error) {
      this.logger.error(`收藏商品失败`, error.stack, { userId, productId });
      throw error;
    }
  }

  async removeFavorite(userId: string, productId: number): Promise<void> {
    this.logger.log(`用户 ${userId} 尝试取消收藏商品 ${productId}`);
    const result = await this.userFavoriteRepository.delete({ userId, productId });

    if (result.affected === 0) {
      throw new NotFoundException('未找到要取消的收藏');
    }
    this.logger.log(`用户 ${userId} 成功取消收藏商品 ${productId}`);
  }

  async getFavorites(userId: string, page: number = 1, limit: number = 10): Promise<{ data: Product[]; total: number }> {
    this.logger.log(`查询用户 ${userId} 的收藏列表`, { page, limit });
    const skip = (page - 1) * limit;

    const [favorites, total] = await this.userFavoriteRepository.findAndCount({
      where: { userId },
      relations: ['product', 'product.subcategory'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const products = favorites.map(fav => fav.product);
    this.logger.log(`成功获取用户 ${userId} 的 ${products.length} 条收藏`);
    return { data: products, total };
  }
}
