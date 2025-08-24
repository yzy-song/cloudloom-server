/*
 * @Author: yzy
 * @Date: 2025-08-24 23:21:43
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-25 00:03:31
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
