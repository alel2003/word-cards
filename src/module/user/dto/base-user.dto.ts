import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class BaseUserDto {
  @ApiProperty({
    description: 'email for authorization',
    example: 'test@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'password for authorization', example: '123456' })
  @MinLength(6)
  @IsString()
  password: string;
}
