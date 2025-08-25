import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class PaymentWebhookDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  object: string;

  @IsObject()
  data: {
    object: {
      id: string;
      amount: number;
      currency: string;
      status: string;
      // Add other relevant fields as needed
    };
  };

  @IsString()
  @IsNotEmpty()
  type: string;
}