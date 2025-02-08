import { PartialType } from '@nestjs/mapped-types';
import { BaseCardDto } from './base-card.dto';

export class UpdateCardDto extends PartialType(BaseCardDto) {}
