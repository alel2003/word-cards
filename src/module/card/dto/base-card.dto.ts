import {
  IsArray,
  ValidateNested,
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ExampleDto {
  @ApiProperty({
    description: 'example text with worl',
    example: 'hello world',
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: 'ID card',
    example: 123,
    required: false,
  })
  @IsOptional()
  @IsInt()
  wordCardId?: number;
}

export class BaseCardDto {
  @ApiProperty({ description: 'word in card', example: 'hello' })
  @IsString()
  word: string;

  @ApiProperty({ description: 'translation in card', example: 'привет' })
  @IsString()
  translation: string;

  @ApiProperty({ description: 'Is card deleted?', example: false })
  @IsBoolean()
  isDelete: boolean = false;

  @ApiProperty({
    description: 'examples with word in card',
    type: [ExampleDto],
    example: [{ text: 'hello world' }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExampleDto)
  examples?: ExampleDto[];

  @ApiProperty({
    description: 'Additional metadata',
    example: { createdAt: '2024-01-01' },
  })
  data?: any;
}
