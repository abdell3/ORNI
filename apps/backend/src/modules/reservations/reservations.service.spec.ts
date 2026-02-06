import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventStatus, ReservationStatus } from '@prisma/client';
import { ReservationsRepository } from './repositories/reservations.repository';
import { ReservationsService } from './reservations.service';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let repository: {
    create: jest.Mock;
    findById: jest.Mock;
    findManyByEventId: jest.Mock;
    findActiveByUserAndEvent: jest.Mock;
    countConfirmedByEventId: jest.Mock;
    findEventById: jest.Mock;
    updateStatus: jest.Mock;
  };

  const mockEvent = {
    id: 'event-id',
    title: 'Test Event',
    capacity: 10,
    status: EventStatus.PUBLISHED,
  };

  const mockReservation = {
    id: 'res-id',
    userId: 'user-id',
    eventId: 'event-id',
    status: ReservationStatus.PENDING,
    event: mockEvent,
    user: { id: 'user-id' },
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findManyByEventId: jest.fn(),
      findActiveByUserAndEvent: jest.fn(),
      countConfirmedByEventId: jest.fn(),
      findEventById: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: ReservationsRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get(ReservationsService);
    repository = mockRepository;
  });

  describe('create', () => {
    it('should create reservation when valid', async () => {
      repository.findEventById.mockResolvedValue(mockEvent);
      repository.countConfirmedByEventId.mockResolvedValue(5);
      repository.findActiveByUserAndEvent.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockReservation);

      const result = await service.create('event-id', 'user-id');

      expect(result.status).toBe(ReservationStatus.PENDING);
      expect(repository.create).toHaveBeenCalledWith(
        'user-id',
        'event-id',
        ReservationStatus.PENDING,
      );
    });

    it('should throw NotFoundException when event does not exist', async () => {
      repository.findEventById.mockResolvedValue(null);

      await expect(service.create('unknown-id', 'user-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create('unknown-id', 'user-id')).rejects.toThrow(
        'Événement non trouvé',
      );
    });

    it('should throw BadRequestException when event is not PUBLISHED', async () => {
      repository.findEventById.mockResolvedValue({
        ...mockEvent,
        status: EventStatus.DRAFT,
      });

      await expect(service.create('event-id', 'user-id')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create('event-id', 'user-id')).rejects.toThrow(
        'Seuls les événements publiés peuvent être réservés',
      );
    });

    it('should throw BadRequestException when event is full', async () => {
      repository.findEventById.mockResolvedValue(mockEvent);
      repository.countConfirmedByEventId.mockResolvedValue(10);

      await expect(service.create('event-id', 'user-id')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create('event-id', 'user-id')).rejects.toThrow(
        "L'événement est complet",
      );
    });

    it('should throw BadRequestException on double reservation', async () => {
      repository.findEventById.mockResolvedValue(mockEvent);
      repository.countConfirmedByEventId.mockResolvedValue(5);
      repository.findActiveByUserAndEvent.mockResolvedValue(mockReservation);

      await expect(service.create('event-id', 'user-id')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create('event-id', 'user-id')).rejects.toThrow(
        'Vous avez déjà une réservation active pour cet événement',
      );
    });
  });

  describe('confirm', () => {
    it('should confirm PENDING reservation when event has capacity', async () => {
      repository.findById.mockResolvedValue(mockReservation);
      repository.countConfirmedByEventId.mockResolvedValue(5);
      repository.updateStatus.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CONFIRMED,
      });

      const result = await service.confirm('res-id');

      expect(result.status).toBe(ReservationStatus.CONFIRMED);
      expect(repository.updateStatus).toHaveBeenCalledWith(
        'res-id',
        ReservationStatus.CONFIRMED,
      );
    });

    it('should throw BadRequestException when event is full', async () => {
      repository.findById.mockResolvedValue(mockReservation);
      repository.countConfirmedByEventId.mockResolvedValue(10);

      await expect(service.confirm('res-id')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.confirm('res-id')).rejects.toThrow(
        "L'événement est complet",
      );
    });

    it('should throw BadRequestException when reservation is not PENDING', async () => {
      repository.findById.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CONFIRMED,
      });

      await expect(service.confirm('res-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('refuse', () => {
    it('should refuse PENDING reservation', async () => {
      repository.findById.mockResolvedValue(mockReservation);
      repository.updateStatus.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.REFUSED,
      });

      const result = await service.refuse('res-id');

      expect(result.status).toBe(ReservationStatus.REFUSED);
      expect(repository.updateStatus).toHaveBeenCalledWith(
        'res-id',
        ReservationStatus.REFUSED,
      );
    });

    it('should throw BadRequestException when reservation is not PENDING', async () => {
      repository.findById.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CONFIRMED,
      });

      await expect(service.refuse('res-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cancelByAdmin', () => {
    it('should cancel reservation', async () => {
      repository.findById.mockResolvedValue(mockReservation);
      repository.updateStatus.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CANCELED,
      });

      const result = await service.cancelByAdmin('res-id');

      expect(result.status).toBe(ReservationStatus.CANCELED);
      expect(repository.updateStatus).toHaveBeenCalledWith(
        'res-id',
        ReservationStatus.CANCELED,
      );
    });

    it('should throw NotFoundException when reservation does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.cancelByAdmin('unknown-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('cancelByParticipant', () => {
    it('should cancel own reservation', async () => {
      repository.findById.mockResolvedValue(mockReservation);
      repository.updateStatus.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CANCELED,
      });

      const result = await service.cancelByParticipant('res-id', 'user-id');

      expect(result.status).toBe(ReservationStatus.CANCELED);
    });

    it('should throw ForbiddenException when canceling another user reservation', async () => {
      repository.findById.mockResolvedValue(mockReservation);

      await expect(
        service.cancelByParticipant('res-id', 'other-user-id'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.cancelByParticipant('res-id', 'other-user-id'),
      ).rejects.toThrow('Vous ne pouvez annuler que vos propres réservations');
    });

    it('should throw BadRequestException when reservation is REFUSED', async () => {
      repository.findById.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.REFUSED,
      });

      await expect(
        service.cancelByParticipant('res-id', 'user-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
