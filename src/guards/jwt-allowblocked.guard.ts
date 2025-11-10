import { NextFunction, Request, Response } from 'express';
import { UserEntity } from '../database';
import { UnauthorizedException } from '../exceptions';
import { JwtService } from '../jwt/jwt.service';

export const JwtAllowBlockedGuard = (jwtService: JwtService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = req.headers['authorization'];
      if (!auth) return next(new UnauthorizedException());

      const [schema, token] = auth.split(' ');
      if (schema !== 'Bearer' || !token) return next(new UnauthorizedException());

      // Проверяем подпись токена, но НЕ проверяем isActive
      const valid = jwtService.verify(token, 'access');
      if (!valid) return next(new UnauthorizedException());

      const payload = jwtService.decode(token);
      const user = await UserEntity.findByPk(payload.id, {
        attributes: { exclude: ['password'] },
      });

      if (!user) return next(new UnauthorizedException());

      // Даже если user.isActive === false — всё равно пропускаем!
      res.locals.user = user;
      next();
    } catch (err) {
      next(new UnauthorizedException());
    }
  };
};
