import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  readonly amount: string;

  @IsNotEmpty()
  @IsString()
  readonly currency: string;

  @IsNotEmpty()
  @IsString()
  readonly paymentMethodId: string;

  @IsString()
  readonly description?: string;
}