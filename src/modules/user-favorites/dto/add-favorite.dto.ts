import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AddFavoriteDto {
  @ApiProperty({ description: '要收藏的商品ID', example: 1 })
  @IsNotEmpty({ message: '商品ID不能为空' })
  @IsInt({ message: '商品ID必须是整数' })
  productId: number;
}
