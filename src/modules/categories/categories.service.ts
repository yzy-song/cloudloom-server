/*
 * @Author: yzy
 * @Date: 2025-08-23 04:22:24
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-27 22:43:54
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../core/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  /**
   * 查询所有分类，并包含其下的所有子分类
   */
  async findAll(): Promise<Category[]> {
    // 使用 relations 选项来加载关联的 subcategories
    return await this.categoryRepository.find({
      relations: ['subcategories'],
    });
  }

  /**
   * 查询单个分类，并包含其下的所有子分类
   */
  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      // 修复：将 'products' 修正为 'subcategories'
      relations: ['subcategories'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    const updated = this.categoryRepository.merge(category, updateCategoryDto);
    return await this.categoryRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }

  // 在服务层添加软删除方法
  async softRemove(id: number): Promise<void> {
    await this.categoryRepository.update(id, {
      isActive: false,
    });
  }

  // 查询时自动过滤已删除记录
  async findActive(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { isActive: true },
    });
  }
}
