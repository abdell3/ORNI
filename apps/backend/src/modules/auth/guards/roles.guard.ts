import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../roles.decorator';
import { Role } from '../role.enum';

interface UserWithRole {
  role?: string;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) {
      return true;
    }
    const { user } = context
      .switchToHttp()
      .getRequest<{ user?: UserWithRole }>();
    const userRole = user?.role;
    if (!userRole) {
      throw new ForbiddenException('Accès refusé');
    }
    const hasRole = requiredRoles.some((role) => (role as string) === userRole);
    if (!hasRole) {
      throw new ForbiddenException('Accès refusé');
    }
    return true;
  }
}
