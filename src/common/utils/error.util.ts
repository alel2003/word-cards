import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export function badRequestException(condition: any, message: string) {
  if (condition) {
    throw new BadRequestException(message);
  }
}

export function unauthorizedException(condition: boolean, message: string) {
  if (condition) {
    throw new UnauthorizedException(message);
  }
}

export function notFoundException(condition: boolean, message: string) {
  if (condition) {
    throw new NotFoundException(message);
  }
}
