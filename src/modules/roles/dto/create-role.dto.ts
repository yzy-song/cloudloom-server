import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;
}
