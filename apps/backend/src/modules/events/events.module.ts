import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { PrismaModule } from '../../prisma/prisma.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventsRepository } from './repositories/events.repository';

@Module({
  imports: [PrismaModule, PassportModule],
  controllers: [EventsController],
  providers: [
    EventsRepository,
    EventsService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [EventsService],
})
export class EventsModule {}
