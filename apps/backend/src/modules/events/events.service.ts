import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Event, EventStatus } from '@prisma/client';
import { ReservationsRepository } from '../reservations/repositories/reservations.repository';
import { EventFilters } from './repositories/events.repository';
import { EventsRepository } from './repositories/events.repository';

@Injectable()
export class EventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  async create(data: {
    title: string;
    description: string;
    date: string;
    location: string;
    capacity: number;
  }): Promise<Event> {
    return this.eventsRepository.create({
      ...data,
      date: new Date(data.date),
      status: EventStatus.DRAFT,
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      date?: string;
      location?: string;
      capacity?: number;
    },
  ): Promise<Event> {
    const event = await this.eventsRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Événement non trouvé');
    }
    if (event.status === EventStatus.CANCELED) {
      throw new BadRequestException('Canceled events cannot be modified');
    }
    if (data.capacity !== undefined) {
      const confirmedCount =
        await this.reservationsRepository.countConfirmedByEventId(id);
      if (data.capacity < confirmedCount) {
        throw new BadRequestException(
          'Capacity cannot be lower than confirmed reservations',
        );
      }
    }
    const updateData: {
      title?: string;
      description?: string;
      date?: Date;
      location?: string;
      capacity?: number;
    } = {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.date !== undefined && { date: new Date(data.date) }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.capacity !== undefined && { capacity: data.capacity }),
    };
    return this.eventsRepository.update(id, updateData);
  }

  async publish(id: string): Promise<Event> {
    const event = await this.eventsRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Événement non trouvé');
    }
    if (event.status === EventStatus.CANCELED) {
      throw new BadRequestException(
        'Un événement annulé ne peut pas être republié',
      );
    }
    if (event.status === EventStatus.PUBLISHED) {
      return event;
    }
    return this.eventsRepository.update(id, {
      status: EventStatus.PUBLISHED,
    });
  }

  async cancel(id: string): Promise<Event> {
    const event = await this.eventsRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Événement non trouvé');
    }
    return this.eventsRepository.update(id, {
      status: EventStatus.CANCELED,
    });
  }

  async listPublished(filters?: EventFilters): Promise<Event[]> {
    return this.eventsRepository.findManyPublished(filters);
  }

  async getPublishedById(id: string): Promise<Event> {
    const event = await this.eventsRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Événement non trouvé');
    }
    if (event.status !== EventStatus.PUBLISHED) {
      throw new NotFoundException('Événement non trouvé');
    }
    return event;
  }

  async getById(id: string): Promise<Event> {
    const event = await this.eventsRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Événement non trouvé');
    }
    return event;
  }
}
