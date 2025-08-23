import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual, In, ILike } from 'typeorm';
import { Product } from '../../core/entities/product.entity';
import { Category } from '../../core/entities/category.entity';

import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/create-product.dto';

import { AppLogger } from '../../utils/logger';

@Injectable()
export class ProductsService {
  private readonly logger = new AppLogger();
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      // Convert category string to Category entity
      const category = await this.categoriesRepository.findOne({
        where: { name: createProductDto.category },
      });

      if (!category) {
        throw new BadRequestException(`分类 "${createProductDto.category}" 不存在`);
      }

      const product = this.productsRepository.create({
        ...createProductDto,
        category, // Replace string with Category entity
      });

      this.logger.debug('Create products');
      return await this.productsRepository.save(product);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('创建产品失败: ' + error.message);
    }
  }

  async findAll(query: ProductQueryDto): Promise<{ data: Product[]; count: number; page: number; limit: number }> {
    const { page = 1, limit = 1, dynasty, category, tag, search, sort, minPrice, maxPrice } = query;
    const skip = (page - 1) * limit;
    // 创建查询构建器
    const queryBuilder = this.productsRepository.createQueryBuilder('product');

    // 添加筛选条件
    if (dynasty) {
      queryBuilder.andWhere('product.dynasty = :dynasty', { dynasty });
    }

    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    if (tag) {
      queryBuilder.andWhere('product.tags::jsonb @> :tag', { tag: JSON.stringify([tag]) });
    }

    if (search) {
      queryBuilder.andWhere('(product.title ILIKE :search OR product.description ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // 只获取激活的产品
    queryBuilder.andWhere('product.isActive = :isActive', { isActive: true });

    // 添加排序
    switch (sort) {
      case 'newest':
        queryBuilder.orderBy('product.createdAt', 'DESC');
        break;
      case 'popular':
        queryBuilder.orderBy('product.reviews', 'DESC');
        break;
      case 'price-asc':
        queryBuilder.orderBy('product.price', 'ASC');
        break;
      case 'price-desc':
        queryBuilder.orderBy('product.price', 'DESC');
        break;
      default:
        queryBuilder.orderBy('product.createdAt', 'DESC');
    }

    // 获取总数
    const total = await queryBuilder.getCount();

    // 添加分页
    queryBuilder.skip(skip).take(limit);

    // 执行查询
    const data = await queryBuilder.getMany();

    return {
      data,
      count: total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id, isActive: true },
    });

    if (!product) {
      throw new NotFoundException(`产品 #${id} 未找到`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`产品 #${id} 未找到`);
    }

    try {
      // 创建安全的合并数据对象
      const mergeData: Partial<Product> = {};

      // 手动复制每个字段，确保类型正确
      if (updateProductDto.title !== undefined) {
        mergeData.title = updateProductDto.title;
      }

      if (updateProductDto.description !== undefined) {
        mergeData.description = updateProductDto.description;
      }

      if (updateProductDto.price !== undefined) {
        mergeData.price = updateProductDto.price;
      }

      // 特殊处理 category 字段
      if (updateProductDto.category !== undefined) {
        if (typeof updateProductDto.category === 'string') {
          const category = await this.categoriesRepository.findOne({
            where: { name: updateProductDto.category },
          });
          if (!category) {
            throw new BadRequestException(`分类 "${updateProductDto.category}" 不存在`);
          }
          mergeData.category = category;
        } else {
          mergeData.category = updateProductDto.category;
        }
      }

      // 使用 merge 方法
      const updatedProduct = this.productsRepository.merge(product, mergeData);
      return await this.productsRepository.save(updatedProduct);
    } catch (error) {
      throw new BadRequestException('更新产品失败: ' + error.message);
    }
  }

  async remove(id: number): Promise<void> {
    const result = await this.productsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`产品 #${id} 未找到`);
    }
  }

  // 获取所有朝代选项
  async getDynastyOptions(): Promise<string[]> {
    const dynasties = await this.productsRepository.createQueryBuilder('product').select('DISTINCT product.dynasty', 'dynasty').where('product.isActive = :isActive', { isActive: true }).orderBy('dynasty', 'ASC').getRawMany();

    return dynasties.map(d => d.dynasty);
  }

  // 获取所有分类选项
  async getCategoryOptions(): Promise<string[]> {
    const categories = await this.productsRepository.createQueryBuilder('product').select('DISTINCT product.category', 'category').where('product.isActive = :isActive', { isActive: true }).orderBy('category', 'ASC').getRawMany();

    return categories.map(c => c.category);
  }
}
