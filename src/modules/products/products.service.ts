/*
 * @Author: yzy
 * @Date: 2025-08-19 23:12:29
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-27 23:18:43
 */
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Product } from '../../core/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Subcategory } from 'src/core/entities/subcategory.entity';
export interface FindAllProductsParams {
  page?: number;
  limit?: number;
  categoryId?: number;
  subcategoryId?: number;
  isActive?: boolean;
  tags?: string;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    this.logger.log('创建商品', { createProductDto });
    const subcategory = await this.subcategoryRepository.findOne({
      where: { id: createProductDto.subcategoryId },
    });
    if (!subcategory) {
      this.logger.error('创建商品失败，子分类不存在', undefined, { subcategoryId: createProductDto.subcategoryId });
      throw new NotFoundException(`子分类ID ${createProductDto.subcategoryId} 不存在`);
    }
    const product = this.productRepository.create({
      ...createProductDto,
      images: createProductDto.images?.map(img => (typeof img === 'string' ? img : img.url)), // 假设ImageDto有url字段
    });
    try {
      const saved = await this.productRepository.save(product);
      this.logger.log('商品创建成功', { id: saved.id });
      return saved;
    } catch (error) {
      this.logger.error('商品创建失败', error?.stack, { createProductDto });
      throw error;
    }
  }

  async findAll(params: FindAllProductsParams) {
    this.logger.log('查询商品列表', params);
    const { page = 1, limit = 12, categoryId, subcategoryId, isActive, tags } = params;
    const skip = (page - 1) * limit;

    const query = this.productRepository.createQueryBuilder('product').leftJoinAndSelect('product.subcategory', 'subcategory').where('1=1');

    if (subcategoryId !== undefined) {
      query.andWhere('product.subcategoryId = :subcategoryId', { subcategoryId });
    }
    if (isActive !== undefined) {
      query.andWhere('product.isActive = :isActive', { isActive });
    }
    if (tags) {
      const tagArr = tags.split(',');
      for (const tag of tagArr) {
        query.andWhere(`product.tags @> :tag`, { tag: JSON.stringify([tag]) });
      }
    }
    if (categoryId !== undefined) {
      // 查询该大类下所有子分类id
      const subcategories = await this.subcategoryRepository.find({ where: { category: { id: categoryId } } });
      const subcategoryIds = subcategories.map(sc => sc.id);
      if (subcategoryIds.length > 0) {
        query.andWhere('product.subcategoryId IN (:...subcategoryIds)', { subcategoryIds });
      } else {
        // 没有子分类，直接返回空
        return { data: [], total: 0 };
      }
    }

    try {
      const [data, total] = await query.skip(skip).take(limit).orderBy('product.createdAt', 'DESC').getManyAndCount();
      this.logger.log(`商品列表获取成功，总数: ${total}`);
      return { data, total };
    } catch (error) {
      this.logger.error('商品列表获取失败', error?.stack, params);
      throw error;
    }
  }

  async findOne(id: number): Promise<{ data: Product; message: string }> {
    this.logger.log(`查询商品详情 id=${id}`);
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['subcategory'],
    });

    if (!product) {
      this.logger.error('商品详情未找到', undefined, { id });
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    this.logger.log('商品详情获取成功', { id });
    return { data: product, message: 'Product retrieved successfully' };
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<{ data: Product }> {
    this.logger.log(`更新商品 id=${id}`, { updateProductDto });
    const product = await this.findOne(id);
    const updateData = {
      ...updateProductDto,
      images: updateProductDto.images?.map(img => (typeof img === 'string' ? img : img.url)),
    };
    const updated = this.productRepository.merge(product.data, updateData);
    try {
      const saved = await this.productRepository.save(updated);
      this.logger.log('商品更新成功', { id });
      return { data: saved };
    } catch (error) {
      this.logger.error('商品更新失败', error?.stack, { id, updateProductDto });
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`删除商品 id=${id}`);
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      this.logger.error('商品删除失败，未找到', undefined, { id });
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    this.logger.log('商品删除成功', { id });
  }

  async updateStock(id: number, quantity: number): Promise<{ data: Product }> {
    this.logger.log(`修改商品库存 id=${id}, quantity=${quantity}`);
    const product = await this.findOne(id);
    product.data.stockQuantity = quantity;
    try {
      const saved = await this.productRepository.save(product.data);
      this.logger.log('商品库存修改成功', { id, quantity });
      return { data: saved };
    } catch (error) {
      this.logger.error('商品库存修改失败', error?.stack, { id, quantity });
      throw error;
    }
  }

  async updateActiveStatus(id: number, isActive: boolean): Promise<Product> {
    this.logger.log(`修改商品上架状态 id=${id}, isActive=${isActive}`);
    const product = await this.findOne(id);
    product.data.isActive = isActive;
    try {
      const saved = await this.productRepository.save(product.data);
      this.logger.log('商品上架状态修改成功', { id, isActive });
      return saved;
    } catch (error) {
      this.logger.error('商品上架状态修改失败', error?.stack, { id, isActive });
      throw error;
    }
  }

  async findByTags(tags: string[]): Promise<Product[]> {
    this.logger.log('根据标签查询商品', { tags });
    try {
      const products = await this.productRepository.find({
        where: {
          tags: In(tags),
          isActive: true,
        },
        take: 20,
      });
      this.logger.log('标签商品查询成功', { count: products.length });
      return products;
    } catch (error) {
      this.logger.error('标签商品查询失败', error?.stack, { tags });
      throw error;
    }
  }

  async findRelated(id: number, limit: number): Promise<{ data: Product[]; message?: string }> {
    this.logger.log(`查询相关商品 id=${id}, limit=${limit}`);
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      this.logger.error('相关商品查询失败，商品未找到', undefined, { id });
      return { data: [], message: 'Product not found' };
    }
    try {
      const relatedProducts = await this.productRepository.find({
        where: {
          subcategoryId: product.subcategoryId,
          id: Not(id), // 排除自身
        },
        take: limit, // 返回指定数量的相关产品
      });
      this.logger.log('相关商品查询成功', { id, count: relatedProducts.length });
      return { data: relatedProducts };
    } catch (error) {
      this.logger.error('相关商品查询失败', error?.stack, { id, limit });
      throw error;
    }
  }
}
