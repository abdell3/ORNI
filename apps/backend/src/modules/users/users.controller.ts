import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { UserProfile, UserReservation, UsersService } from './users.service';

export interface RequestWithUser extends Request {
  user: JwtPayload;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@Req() req: RequestWithUser): Promise<UserProfile> {
    const userId = req.user.sub;
    return this.usersService.getProfile(userId);
  }

  @Get('me/reservations')
  getReservations(@Req() req: RequestWithUser): Promise<UserReservation[]> {
    const userId = req.user.sub;
    return this.usersService.getReservations(userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getAllUsers(): Promise<UserProfile[]> {
    return this.usersService.getAllUsers();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getUserById(@Param('id', ParseUUIDPipe) id: string): Promise<UserProfile> {
    return this.usersService.getProfile(id);
  }

  @Get(':id/reservations')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getUserReservations(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserReservation[]> {
    return this.usersService.getReservations(id);
  }
}
