/*
 * @Author: yzy
 * @Date: 2025-08-19 23:12:29
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-27 23:18:43
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Product } from '../../core/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AppLogger } from '../../utils/logger';
import { Subcategory } from 'src/core/entities/subcategory.entity';
export interface FindAllProductsParams {
  page?: number;
  limit?: number;
  subcategoryId?: number;
  isActive?: boolean;
  tags?: string;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,

    private readonly logger: AppLogger // 依赖注入
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // 验证子分类是否存在
    const subcategory = await this.subcategoryRepository.findOne({
      where: { id: createProductDto.subcategoryId },
    });
    if (!subcategory) {
      throw new NotFoundException(`子分类ID ${createProductDto.subcategoryId} 不存在`);
    }
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findAll(params: FindAllProductsParams) {
    const { page = 1, limit = 10, subcategoryId, isActive, tags } = params;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (subcategoryId !== undefined) {
      where.subcategoryId = subcategoryId;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (tags) {
      where.tags = In(tags.split(','));
    }
    const [data, total] = await this.productRepository.findAndCount({
      where,
      relations: ['subcategory'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    this.logger.log(`Fetched products - total: ${total}`);
    return { data, total };
  }

  async findOne(id: number): Promise<{ data: Product; message: string }> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['subcategory'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return { data: product, message: 'Product retrieved successfully' };
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<{ data: Product }> {
    const product = await this.findOne(id);
    const updated = this.productRepository.merge(product.data, updateProductDto);
    return { data: await this.productRepository.save(updated) };
  }

  async remove(id: number): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async updateStock(id: number, quantity: number): Promise<{ data: Product }> {
    const product = await this.findOne(id);
    product.data.stockQuantity = quantity;
    return { data: await this.productRepository.save(product.data) };
  }

  async updateActiveStatus(id: number, isActive: boolean): Promise<Product> {
    const product = await this.findOne(id);
    product.data.isActive = isActive;
    return await this.productRepository.save(product.data);
  }

  async findByTags(tags: string[]): Promise<Product[]> {
    return await this.productRepository.find({
      where: {
        tags: In(tags),
        isActive: true,
      },
      take: 20,
    });
  }

  async findRelated(id: number, limit: number): Promise<{ data: Product[]; message?: string }> {
    // 这里可以根据实际业务，比如同分类、同标签等，返回相关产品
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) return { data: [], message: 'Product not found' };
    const relatedProducts = await this.productRepository.find({
      where: {
        subcategoryId: product.subcategoryId,
        id: Not(id), // 排除自身
      },
      take: limit, // 返回指定数量的相关产品
    });
    return { data: relatedProducts };
  }
}
