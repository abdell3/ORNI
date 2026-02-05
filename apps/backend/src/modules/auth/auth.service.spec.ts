import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
  };
  let configGet: jest.Mock;

  const JWT_ACCESS_SECRET = 'test-access-secret';
  const JWT_REFRESH_SECRET = 'test-refresh-secret';

  beforeEach(async () => {
    configGet = jest.fn((key: string) => {
      const map: Record<string, string> = {
        JWT_ACCESS_SECRET,
        JWT_REFRESH_SECRET,
        JWT_ACCESS_EXPIRATION: '15m',
        JWT_REFRESH_EXPIRATION: '7d',
      };
      return map[key];
    });

    const mockPrisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    } as {
      user: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: { get: configGet } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = mockPrisma;
  });

  describe('register', () => {
    it('should create a user with role PARTICIPANT', async () => {
      const dto = {
        email: 'user@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };
      const createdUser = {
        id: 'user-id',
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: UserRole.PARTICIPANT,
      };
      prisma.user.create.mockResolvedValue(createdUser);

      const result = await service.register(dto);

      expect(result).toEqual({
        id: createdUser.id,
        email: createdUser.email,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        role: UserRole.PARTICIPANT,
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: UserRole.PARTICIPANT,
        }) as object,
      });
    });

    it('should throw ConflictException if email already used', async () => {
      prisma.user.create.mockRejectedValue({ code: 'P2002' });

      await expect(
        service.register({
          email: 'existing@test.com',
          password: 'password123',
          firstName: 'Jane',
          lastName: 'Doe',
        }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.register({
          email: 'existing@test.com',
          password: 'password123',
          firstName: 'Jane',
          lastName: 'Doe',
        }),
      ).rejects.toThrow('Un compte existe déjà avec cet email');
    });
  });

  describe('login', () => {
    it('should return tokens on success', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = {
        id: 'user-id',
        email: 'user@test.com',
        password: hashedPassword,
        role: UserRole.PARTICIPANT,
      };
      prisma.user.findUnique.mockResolvedValue(user);
      prisma.user.update.mockResolvedValue(user);

      const result = await service.login({
        email: 'user@test.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(typeof result.accessToken).toBe('string');
      expect(typeof result.refreshToken).toBe('string');
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      const hashedPassword = await bcrypt.hash('other', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'user@test.com',
        password: hashedPassword,
        role: UserRole.PARTICIPANT,
      });

      await expect(
        service.login({ email: 'user@test.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login({ email: 'user@test.com', password: 'wrongpassword' }),
      ).rejects.toThrow('Identifiants invalides');
    });

    it('should throw UnauthorizedException if email does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'unknown@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login({
          email: 'unknown@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow('Identifiants invalides');
    });
  });

  describe('refresh', () => {
    it('should return new tokens on valid refresh token', async () => {
      const refreshToken = jwt.sign({ sub: 'user-id' }, JWT_REFRESH_SECRET, {
        expiresIn: '7d',
      });
      const hashedRefresh = await bcrypt.hash(refreshToken, 10);
      const user = {
        id: 'user-id',
        email: 'user@test.com',
        role: UserRole.PARTICIPANT,
        refreshToken: hashedRefresh,
      };
      prisma.user.findUnique.mockResolvedValue(user);
      prisma.user.update.mockResolvedValue(user);

      const result = await service.refresh(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const invalidToken = jwt.sign({ sub: 'user-id' }, JWT_REFRESH_SECRET, {
        expiresIn: '7d',
      });

      await expect(service.refresh(invalidToken)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh(invalidToken)).rejects.toThrow(
        'Token invalide ou expiré',
      );
    });
  });
});
