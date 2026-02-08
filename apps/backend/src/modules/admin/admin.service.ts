import { Injectable } from '@nestjs/common';
import { EventStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface AdminStats {
  totalEvents: number;
  totalPublishedEvents: number;
  totalUsers: number;
  totalReservations: number;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<AdminStats> {
    const [totalEvents, totalPublishedEvents, totalUsers, totalReservations] =
      await Promise.all([
        this.prisma.event.count(),
        this.prisma.event.count({
          where: { status: EventStatus.PUBLISHED },
        }),
        this.prisma.user.count(),
        this.prisma.reservation.count(),
      ]);
    return {
      totalEvents,
      totalPublishedEvents,
      totalUsers,
      totalReservations,
    };
  }
}
