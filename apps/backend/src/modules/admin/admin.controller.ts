import { Controller, Get, UseGuards } from '@nestjs/common';
import { Event } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminService, AdminStats } from './admin.service';
import { EventsService } from '../events/events.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly eventsService: EventsService,
  ) {}

  @Get('events')
  listAllEvents(): Promise<Event[]> {
    return this.eventsService.listAllForAdmin();
  }

  @Get('stats')
  getStats(): Promise<AdminStats> {
    return this.adminService.getStats();
  }
}
