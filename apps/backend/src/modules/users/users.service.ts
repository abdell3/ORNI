import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersRepository } from './repositories/users.repository';

export type UserProfile = Omit<User, 'password' | 'refreshToken'>;

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getReservations(userId: string) {
    return this.usersRepository.findReservationsByUserId(userId);
  }
}
