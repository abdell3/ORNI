import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { PrismaModule } from '../../prisma/prisma.module';
import { EventReservationsController } from './event-reservations.controller';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ReservationsRepository } from './repositories/reservations.repository';

@Module({
  imports: [PrismaModule, PassportModule],
  controllers: [ReservationsController, EventReservationsController],
  providers: [
    ReservationsRepository,
    ReservationsService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [ReservationsService],
})
export class ReservationsModule {}
