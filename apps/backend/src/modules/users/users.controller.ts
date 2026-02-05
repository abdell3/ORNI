import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@Req() req: Request & { user: JwtPayload }) {
    return this.usersService.getProfile(req.user.sub);
  }

  @Get('me/reservations')
  getReservations(@Req() req: Request & { user: JwtPayload }) {
    return this.usersService.getReservations(req.user.sub);
  }
}
