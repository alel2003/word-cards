import { IsString, MinLength } from 'class-validator';
import { BaseUserDto } from './base-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto extends BaseUserDto {
  @ApiProperty({
    description: 'repeat password for authorization',
    example: '123456',
  })
  @MinLength(6)
  @IsString()
  repeatPassword: string;
}
