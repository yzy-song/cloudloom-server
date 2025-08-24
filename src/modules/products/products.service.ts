/*
 * @Author: yzy
 * @Date: 2025-08-19 23:12:29
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-25 00:28:45
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from '../../core/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findAll(page: number = 1, limit: number = 10, categoryId?: number, isActive?: boolean, tagArray?: string[]): Promise<{ data: Product[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (categoryId !== undefined) {
      where.categoryId = categoryId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (tagArray && tagArray.length > 0) {
      where.tags = In(tagArray);
    }

    const [data, total] = await this.productRepository.findAndCount({
      where,
      relations: ['category'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    const updated = this.productRepository.merge(product, updateProductDto);
    return await this.productRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async updateStock(id: number, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    product.stockQuantity = quantity;
    return await this.productRepository.save(product);
  }

  async updateActiveStatus(id: number, isActive: boolean): Promise<Product> {
    const product = await this.findOne(id);
    product.isActive = isActive;
    return await this.productRepository.save(product);
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
}
