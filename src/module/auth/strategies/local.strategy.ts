import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../auth.service';
import { unauthorizedException } from 'src/common/utils/error.util';
import { UserResponseDto } from '@user/dto/response/response-user.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }
  async validate(email: string, password: string): Promise<UserResponseDto> {
    const user = await this.authService.validateUser(email, password);
    unauthorizedException(!user, 'User not found or invalid token');
    return {
      id: user.id,
      email: user.email,
    };
  }
}
