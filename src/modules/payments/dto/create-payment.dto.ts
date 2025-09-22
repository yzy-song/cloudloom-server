import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  readonly amount: number;

  @IsNotEmpty()
  @IsString()
  readonly currency: string;

  /**
   * 与此支付关联的内部预订/订单ID
   * @example 123
   */
  @IsString()
  @IsNotEmpty()
  bookingNumber: string;

  @IsNotEmpty()
  @IsString()
  readonly paymentMethodId?: string;

  @IsString()
  readonly description?: string;
}
