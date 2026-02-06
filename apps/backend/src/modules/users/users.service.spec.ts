import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: {
    findAll: jest.Mock;
    findById: jest.Mock;
    findReservationsByUserId: jest.Mock;
  };

  const mockUser = {
    id: 'user-id',
    email: 'user@test.com',
    password: 'hashed',
    role: UserRole.PARTICIPANT,
    firstName: 'John',
    lastName: 'Doe',
    refreshToken: 'hashed-refresh',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockReservations = [
    {
      id: 'res-id',
      status: 'CONFIRMED' as const,
      userId: 'user-id',
      eventId: 'event-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      event: {
        id: 'event-id',
        title: 'Event 1',
        description: 'Desc',
        date: new Date(),
        location: 'Paris',
        capacity: 10,
        status: 'PUBLISHED' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
  ];

  beforeEach(async () => {
    const mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findReservationsByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get(UsersService);
    repository = mockRepository;
  });

  describe('getProfile', () => {
    it('should return user profile without password and refreshToken', async () => {
      repository.findById.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-id');

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('refreshToken');
      expect(result).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
        }),
      );
      expect(repository.findById).toHaveBeenCalledWith('user-id');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getProfile('unknown-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getProfile('unknown-id')).rejects.toThrow(
        'Utilisateur non trouvé',
      );
      expect(repository.findById).toHaveBeenCalledWith('unknown-id');
    });
  });

  describe('getReservations', () => {
    it('should return reservations for the user', async () => {
      repository.findReservationsByUserId.mockResolvedValue(mockReservations);

      const result = await service.getReservations('user-id');

      expect(result).toEqual(mockReservations);
      expect(repository.findReservationsByUserId).toHaveBeenCalledWith(
        'user-id',
      );
    });

    it('should return empty array when user has no reservations', async () => {
      repository.findReservationsByUserId.mockResolvedValue([]);

      const result = await service.getReservations('user-id');

      expect(result).toEqual([]);
      expect(repository.findReservationsByUserId).toHaveBeenCalledWith(
        'user-id',
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return all users without password and refreshToken', async () => {
      const users = [
        mockUser,
        { ...mockUser, id: 'user-2', email: 'u2@test.com' },
      ];
      repository.findAll.mockResolvedValue(users);

      const result = await service.getAllUsers();

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[0]).not.toHaveProperty('refreshToken');
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
        }),
      );
      expect(repository.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no users exist', async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await service.getAllUsers();

      expect(result).toEqual([]);
      expect(repository.findAll).toHaveBeenCalled();
    });
  });
});
