import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class PaymentWebhookDto {
  @ApiProperty({ description: 'Webhook事件ID', example: 'evt_1P2...' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: '对象类型', example: 'event' })
  @IsString()
  @IsNotEmpty()
  object: string;

  @ApiProperty({
    description: '事件数据对象',
    example: {
      object: {
        id: 'pi_1P2...',
        amount: 1000,
        currency: 'cny',
        status: 'succeeded',
      },
    },
  })
  @IsObject()
  data: {
    object: {
      id: string;
      amount: number;
      currency: string;
      status: string;
      // 其他字段可根据业务补充
    };
  };

  @ApiProperty({ description: '事件类型', example: 'payment_intent.succeeded' })
  @IsString()
  @IsNotEmpty()
  type: string;
}
