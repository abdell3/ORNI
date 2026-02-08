import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findReservationsByUserId(userId: string) {
    return this.prisma.reservation.findMany({
      where: { userId },
      include: {
        event: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
