import { ApiProperty } from '@nestjs/swagger';

export class OAuthLoginDto {
  @ApiProperty({ description: 'Firebase 登录 idToken' })
  idToken: string;
}
