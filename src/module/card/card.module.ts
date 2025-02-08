import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from 'src/module/user/user.module';

@Module({
  imports: [AuthModule, UserModule],
  controllers: [CardController],
  providers: [CardService, PrismaService, JwtService],
})
export class CardModule {}
