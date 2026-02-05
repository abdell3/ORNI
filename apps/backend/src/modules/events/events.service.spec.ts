import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventStatus } from '@prisma/client';
import { EventsRepository } from './repositories/events.repository';
import { EventsService } from './events.service';

describe('EventsService', () => {
  let service: EventsService;
  let repository: {
    create: jest.Mock;
    findById: jest.Mock;
    findManyPublished: jest.Mock;
    update: jest.Mock;
  };

  const mockEvent = {
    id: 'event-id',
    title: 'Test Event',
    description: 'Description',
    date: new Date('2025-03-01'),
    location: 'Paris',
    capacity: 10,
    status: EventStatus.DRAFT,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPublishedEvent = {
    ...mockEvent,
    status: EventStatus.PUBLISHED,
  };

  const mockCanceledEvent = {
    ...mockEvent,
    status: EventStatus.CANCELED,
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findManyPublished: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: EventsRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get(EventsService);
    repository = mockRepository;
  });

  describe('create', () => {
    it('should create event with DRAFT status', async () => {
      repository.create.mockResolvedValue(mockEvent);

      const result = await service.create({
        title: 'Test',
        description: 'Desc',
        date: '2025-03-01',
        location: 'Paris',
        capacity: 10,
      });

      expect(result.status).toBe(EventStatus.DRAFT);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test',
          description: 'Desc',
          location: 'Paris',
          capacity: 10,
          status: EventStatus.DRAFT,
        }),
      );
    });
  });

  describe('update', () => {
    it('should update event', async () => {
      repository.findById.mockResolvedValue(mockEvent);
      repository.update.mockResolvedValue({
        ...mockEvent,
        title: 'Updated',
      });

      const result = await service.update('event-id', { title: 'Updated' });

      expect(result.title).toBe('Updated');
      expect(repository.update).toHaveBeenCalledWith('event-id', {
        title: 'Updated',
      });
    });

    it('should throw NotFoundException when event does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update('unknown-id', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update('unknown-id', { title: 'Updated' }),
      ).rejects.toThrow('Événement non trouvé');
    });
  });

  describe('publish', () => {
    it('should publish DRAFT event', async () => {
      repository.findById.mockResolvedValue(mockEvent);
      repository.update.mockResolvedValue(mockPublishedEvent);

      const result = await service.publish('event-id');

      expect(result.status).toBe(EventStatus.PUBLISHED);
      expect(repository.update).toHaveBeenCalledWith('event-id', {
        status: EventStatus.PUBLISHED,
      });
    });

    it('should return event if already PUBLISHED', async () => {
      repository.findById.mockResolvedValue(mockPublishedEvent);

      const result = await service.publish('event-id');

      expect(result.status).toBe(EventStatus.PUBLISHED);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when event is CANCELED', async () => {
      repository.findById.mockResolvedValue(mockCanceledEvent);

      await expect(service.publish('event-id')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.publish('event-id')).rejects.toThrow(
        'Un événement annulé ne peut pas être republié',
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when event does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.publish('unknown-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('cancel', () => {
    it('should cancel event', async () => {
      repository.findById.mockResolvedValue(mockPublishedEvent);
      repository.update.mockResolvedValue(mockCanceledEvent);

      const result = await service.cancel('event-id');

      expect(result.status).toBe(EventStatus.CANCELED);
      expect(repository.update).toHaveBeenCalledWith('event-id', {
        status: EventStatus.CANCELED,
      });
    });

    it('should throw NotFoundException when event does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.cancel('unknown-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('listPublished', () => {
    it('should return published events', async () => {
      repository.findManyPublished.mockResolvedValue([mockPublishedEvent]);

      const result = await service.listPublished();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(EventStatus.PUBLISHED);
      expect(repository.findManyPublished).toHaveBeenCalledWith(undefined);
    });

    it('should pass filters to repository', async () => {
      repository.findManyPublished.mockResolvedValue([]);
      const filters = {
        dateFrom: new Date('2025-01-01'),
        dateTo: new Date('2025-12-31'),
        location: 'Paris',
      };

      await service.listPublished(filters);

      expect(repository.findManyPublished).toHaveBeenCalledWith(filters);
    });
  });

  describe('getPublishedById', () => {
    it('should return event when PUBLISHED', async () => {
      repository.findById.mockResolvedValue(mockPublishedEvent);

      const result = await service.getPublishedById('event-id');

      expect(result.status).toBe(EventStatus.PUBLISHED);
    });

    it('should throw NotFoundException when event does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getPublishedById('unknown-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when event is not PUBLISHED', async () => {
      repository.findById.mockResolvedValue(mockEvent);

      await expect(service.getPublishedById('event-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getPublishedById('event-id')).rejects.toThrow(
        'Événement non trouvé',
      );
    });
  });
});
