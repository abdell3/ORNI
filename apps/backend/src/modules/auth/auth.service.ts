import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const SALT_ROUNDS = 10;
const REFRESH_TOKEN_BCRYPT_ROUNDS = 10;

interface AccessTokenPayload {
  sub: string;
  role: UserRole;
}

interface RefreshTokenPayload {
  sub: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }> {
    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: UserRole.PARTICIPANT,
        },
      });
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('Un compte existe déjà avec cet email');
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    const pair = this.issueTokenPair(user.id, user.role);
    const hashedRefresh = await bcrypt.hash(
      pair.refreshToken,
      REFRESH_TOKEN_BCRYPT_ROUNDS,
    );
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefresh },
    });
    return pair;
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const payload = this.verifyRefreshToken(refreshToken);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user?.refreshToken) {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
    const storedHash = user.refreshToken;
    const tokenMatches = await bcrypt.compare(refreshToken, storedHash);
    if (!tokenMatches) {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
    const pair = this.issueTokenPair(user.id, user.role);
    const hashedRefresh = await bcrypt.hash(
      pair.refreshToken,
      REFRESH_TOKEN_BCRYPT_ROUNDS,
    );
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefresh },
    });
    return pair;
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = this.verifyRefreshToken(refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user?.refreshToken) {
        return;
      }
      const storedHash = user.refreshToken;
      const tokenMatches = await bcrypt.compare(refreshToken, storedHash);
      if (tokenMatches) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: null },
        });
      }
    } catch {
      //
    }
  }

  private verifyRefreshToken(token: string): RefreshTokenPayload {
    const secret = this.config.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
    const payload = jwt.verify(token, secret) as RefreshTokenPayload;
    if (!payload?.sub) {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
    return payload;
  }

  private issueTokenPair(userId: string, role: UserRole): TokenPair {
    const accessSecret = this.config.get<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');
    const accessExp = this.config.get<string>('JWT_ACCESS_EXPIRATION') ?? '15m';
    const refreshExp =
      this.config.get<string>('JWT_REFRESH_EXPIRATION') ?? '7d';
    if (!accessSecret || !refreshSecret) {
      throw new InternalServerErrorException(
        'Une erreur de configuration du serveur est survenue',
      );
    }
    const accessToken = jwt.sign(
      { sub: userId, role } as AccessTokenPayload,
      accessSecret,
      { expiresIn: accessExp } as jwt.SignOptions,
    );
    const refreshToken = jwt.sign(
      { sub: userId } as RefreshTokenPayload,
      refreshSecret,
      { expiresIn: refreshExp } as jwt.SignOptions,
    );
    return { accessToken, refreshToken };
  }
}
