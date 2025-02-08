import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  UseGuards,
  Request,
  Put,
  Query,
  HttpStatus,
  Req,
} from '@nestjs/common';

import { Request as ExpressRequest } from 'express';

import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtGuard } from 'src/common/guards/jwt.guard';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

import { PaginationDto } from './dto/pagination/pagination.dto';
import { BaseCardDto } from './dto/base-card.dto';

@UseGuards(JwtGuard)
@ApiTags('Cards')
@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  // swagger
  @ApiOperation({
    summary: 'Create a new card with the given ID and request body',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Unique identifier of the card',
    type: Number,
  })
  @ApiBody({
    type: CreateCardDto,
    description: 'Card data to create',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Card successfully created',
    type: BaseCardDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized: Access token is missing or invalid',
  })

  // create
  @UsePipes(new ValidationPipe())
  @Post('create')
  create(@Request() req: ExpressRequest, @Body() dto: CreateCardDto) {
    return this.cardService.create(req, dto);
  }

  // swagger
  @ApiOperation({ summary: 'Get all cards' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: BaseCardDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid pagination parameters',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized: Access token is missing or invalid',
  })

  // get all
  @Get()
  findAll(@Query() dto: PaginationDto, @Req() req: ExpressRequest) {
    return this.cardService.findAll(dto, req);
  }

  // swagger
  @ApiOperation({ summary: 'Get one card' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Card id',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: BaseCardDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Card not found' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized: Access token is missing or invalid',
  })

  // get:id
  @Get(':id')
  findOne(@Req() req: ExpressRequest, @Param('id', ParseIntPipe) id: number) {
    return this.cardService.findOne(req, id);
  }

  // swagger
  @ApiOperation({ summary: 'Updates a card with specified id' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Card id',
    type: Number,
  })
  @ApiBody({ type: UpdateCardDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: BaseCardDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Card not found' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized: Access token is missing or invalid',
  })

  // update/:id
  @UsePipes(new ValidationPipe())
  @Put('update/:id')
  update(
    @Req() req: ExpressRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCardDto,
  ) {
    return this.cardService.update(req, id, dto);
  }

  // swagger
  @ApiOperation({ summary: 'Delete a card with specified id' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Card id',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: BaseCardDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Card not found' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized: Access token is missing or invalid',
  })

  // delete/:id
  @UsePipes(new ValidationPipe())
  @Patch('delete/:id')
  remove(@Req() req: ExpressRequest, @Param('id', ParseIntPipe) id: number) {
    return this.cardService.remove(req, id);
  }
}
