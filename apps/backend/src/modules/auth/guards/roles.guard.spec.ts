import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../role.enum';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const createMockContext = (
    user: { role?: string } | undefined,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access when user has required role (ADMIN)', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    const context = createMockContext({ role: Role.ADMIN });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException when user role is insufficient (PARTICIPANT for ADMIN-only)', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    const context = createMockContext({ role: Role.PARTICIPANT });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
