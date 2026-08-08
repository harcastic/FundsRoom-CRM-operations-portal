import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/auth.types';
import { AppError } from '../utils/response';

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
    }

    const { role } = req.user;

    // ADMIN always has full access
    if (role === 'ADMIN' || allowedRoles.includes(role)) {
      return next();
    }

    return next(
      new AppError(
        `Access denied. Role '${role}' is not authorized to perform this action`,
        403,
        'FORBIDDEN'
      )
    );
  };
}
