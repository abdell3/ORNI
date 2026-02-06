import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ReservationsService } from './reservations.service';

@Controller('events/:eventId/reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class EventReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  getReservationsByEventId(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.reservationsService.getReservationsByEventId(eventId);
  }
}
