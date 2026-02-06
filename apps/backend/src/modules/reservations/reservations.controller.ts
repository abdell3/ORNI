import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StreamableFile } from '@nestjs/common';
import { Request } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationsService } from './reservations.service';

interface RequestWithUser extends Request {
  user: JwtPayload;
}

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get(':id/ticket')
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="ticket.pdf"')
  async getTicket(
    @Req() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StreamableFile> {
    const userId: string = req.user.sub;
    const role: string = req.user.role;
    const buffer = await this.reservationsService.getTicket(id, userId, role);
    return new StreamableFile(buffer);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARTICIPANT)
  create(@Req() req: RequestWithUser, @Body() dto: CreateReservationDto) {
    return this.reservationsService.create(dto.eventId, req.user.sub);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancel(
    @Req() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const isAdmin = req.user.role === 'ADMIN';
    if (isAdmin) {
      return this.reservationsService.cancelByAdmin(id);
    }
    return this.reservationsService.cancelByParticipant(id, req.user.sub);
  }

  @Patch(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  confirm(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.confirm(id);
  }

  @Patch(':id/refuse')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  refuse(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.refuse(id);
  }
}
