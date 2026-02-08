import { Injectable } from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ReservationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, eventId: string, status: ReservationStatus) {
    return this.prisma.reservation.create({
      data: { userId, eventId, status },
      include: { event: true },
    });
  }

  async findById(id: string) {
    return this.prisma.reservation.findUnique({
      where: { id },
      include: { event: true, user: true },
    });
  }

  async findManyByEventId(eventId: string) {
    return this.prisma.reservation.findMany({
      where: { eventId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActiveByUserAndEvent(userId: string, eventId: string) {
    return this.prisma.reservation.findFirst({
      where: {
        userId,
        eventId,
        status: {
          in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
        },
      },
    });
  }

  async countConfirmedByEventId(eventId: string): Promise<number> {
    return this.prisma.reservation.count({
      where: {
        eventId,
        status: ReservationStatus.CONFIRMED,
      },
    });
  }

  async updateStatus(id: string, status: ReservationStatus) {
    return this.prisma.reservation.update({
      where: { id },
      data: { status },
      include: { event: true },
    });
  }

  async findEventById(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
    });
  }
}
