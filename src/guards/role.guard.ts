import { NextFunction, Request, Response } from 'express';
import { ForbiddenException } from '../exceptions';
import { UserRole } from '../modules/user/user.types';

export const RoleGuard = (requiredRole: UserRole) => (req: Request, res: Response, next: NextFunction) => {
  const userRole = res.locals.user.role;

  // Требуемая роль - admin, а роль пользователя запроса - НЕ admin
  if (userRole !== UserRole.admin && requiredRole === UserRole.admin) {
    throw new ForbiddenException("You don't have permission");
  }

  next();
};
