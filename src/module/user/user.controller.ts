import {
  Controller,
  Body,
  Patch,
  Delete,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtGuard } from 'src/common/guards/jwt.guard';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-auth.dto';
import { BaseUserDto } from './dto/base-user.dto';

@UseGuards(JwtGuard)
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // swager
  @ApiOperation({ summary: 'Updates a user with specified id' })
  @ApiOperation({ summary: 'Updates a user with the specified ID' })
  @ApiBody({ description: 'User data to update', type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully updated',
    type: BaseUserDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Missing or invalid token',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })

  // update
  @Patch('update')
  update(@Req() req: ExpressRequest, @Body() dto: UpdateUserDto) {
    return this.userService.update(req, dto);
  }

  // swager
  @ApiOperation({ summary: 'Delete a user with specified id' })
  @ApiOperation({ summary: 'Delete a user with the specified ID' })
  @ApiBody({ description: 'User data to update', type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully delete',
    type: BaseUserDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Missing or invalid token',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })

  // delete
  @Delete('delete')
  remove(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    return this.userService.remove(req, res);
  }
}
