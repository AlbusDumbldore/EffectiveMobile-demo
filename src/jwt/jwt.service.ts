import { injectable } from 'inversify';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { appConfig } from '../config';
import { UserEntity } from '../database/entities';
import { BadRequestException } from '../exceptions';
import { TokenPair } from './jwt.types';

@injectable()
export class JwtService {
  makeTokenPair(user: UserEntity): TokenPair {
    const payload = { id: user.id };
    const { accessSecret, refreshSecret } = appConfig.jwt;

    const accessToken = jwt.sign(payload, accessSecret, { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '1w' });

    return { accessToken, refreshToken };
  }

  verify(token: string, type: 'access' | 'refresh'): boolean {
    const secrets = {
      access: appConfig.jwt.accessSecret,
      refresh: appConfig.jwt.refreshSecret,
    };

    try {
      jwt.verify(token, secrets[type]);
      return true;
    } catch (err) {
      return false;
    }
  }

  decode(token: string): JwtPayload {
    const decoded = jwt.decode(token, { json: true });

    if (!decoded) {
      throw new BadRequestException('JWT is bad');
    }

    return decoded;
  }
}
