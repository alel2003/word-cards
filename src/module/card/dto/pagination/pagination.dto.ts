import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    example: 1,
    description: 'Page number (must be >= 1)',
    required: false,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  skip: number;

  @ApiProperty({
    example: 10,
    description: 'Number of items per page (must be >= 1)',
    required: false,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  limit: number;
}
