import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './repositories/users.repository';

@Module({
  imports: [PrismaModule, PassportModule],
  controllers: [UsersController],
  providers: [
    UsersRepository,
    UsersService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [UsersService],
})
export class UsersModule {}
