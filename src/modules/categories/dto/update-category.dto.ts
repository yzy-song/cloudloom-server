/*
 * @Author: yzy
 * @Date: 2025-08-23 04:24:15
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-23 09:10:46
 */
/*
 * @Author: yzy
 * @Date: 2025-08-23 04:24:15
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-23 04:26:42
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
