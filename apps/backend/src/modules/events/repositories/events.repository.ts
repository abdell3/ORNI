import { Injectable } from '@nestjs/common';
import { EventStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

export interface EventFilters {
  dateFrom?: Date;
  dateTo?: Date;
  location?: string;
}

@Injectable()
export class EventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    title: string;
    description: string;
    date: Date;
    location: string;
    capacity: number;
    status: EventStatus;
  }) {
    return this.prisma.event.create({
      data,
    });
  }

  async findById(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
    });
  }

  async findManyAllOrderByDateDesc() {
    return this.prisma.event.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async findManyPublished(filters?: EventFilters) {
    const where: {
      status: EventStatus;
      date?: { gte?: Date; lte?: Date };
      location?: { contains: string; mode: 'insensitive' };
    } = {
      status: EventStatus.PUBLISHED,
    };
    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {};
      if (filters.dateFrom) where.date.gte = filters.dateFrom;
      if (filters.dateTo) where.date.lte = filters.dateTo;
    }
    if (filters?.location) {
      where.location = {
        contains: filters.location,
        mode: 'insensitive',
      };
    }
    return this.prisma.event.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      date?: Date;
      location?: string;
      capacity?: number;
      status?: EventStatus;
    },
  ) {
    return this.prisma.event.update({
      where: { id },
      data,
    });
  }
}
