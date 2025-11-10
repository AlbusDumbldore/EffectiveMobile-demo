import axios from 'axios';
import { compare } from 'bcrypt';
import { CronJob } from 'cron';
import { inject, injectable } from 'inversify';
import { redisRefreshTokenKey, redisTempMailKey } from '../../cache/redis.keys';
import { RedisService } from '../../cache/redis.service';
import { TimeInSeconds } from '../../common';
import { LoginHistoryEntity, UserEntity } from '../../database/entities';
import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from '../../exceptions';
import { JwtService } from '../../jwt/jwt.service';
import logger from '../../logger';
import { LoginDto, RegisterDto } from './dto';
import { LoginEvent } from './user.types';

@injectable()
export class UserService {
  private readonly refreshTempDomainsJob = new CronJob('0 */6 * * *', () => this.loadTmpDomains(), null, true);
  private readonly saveLoginBufferJob = new CronJob('*/10 * * * * *', () => this.saveLoginBuffer(), null, true);

  private loginBuffer: LoginEvent[] = [];

  constructor(
    @inject(RedisService) private readonly redisService: RedisService,
    @inject(JwtService) private readonly jwtService: JwtService,
    @inject(RedisService) private readonly redis: RedisService,
  ) {
    this.loadTmpDomains();
  }

  private async loadTmpDomains() {
    try {
      const url = 'https://raw.githubusercontent.com/disposable/disposable-email-domains/master/domains.txt';

      const { data } = await axios.get<string>(url);
      const domains = data.split('\n');

      await Promise.all(
        domains.map((email) =>
          this.redisService.set(
            redisTempMailKey(email),
            { email },
            { expiration: { type: 'EX', value: TimeInSeconds.day } },
          ),
        ),
      );
      logger.info(`Successfully load ${domains.length} temporary email domains`);
    } catch (error) {
      logger.error("Can't update temp domains ");
      logger.error(error);
    }
  }

  private async saveLoginBuffer() {
    if (!this.loginBuffer.length) {
      logger.info('Skip saving login buffer - buffer is empty');
      return;
    }

    logger.info(`Saving login buffer. Logs - ${this.loginBuffer.length}`);

    await LoginHistoryEntity.bulkCreate(this.loginBuffer);

    this.loginBuffer = [];
  }

  private async setNewRefreshToken(userId: number, token: string) {
    return this.redis.set(
      redisRefreshTokenKey(token),
      { userId },
      { expiration: { type: 'EX', value: TimeInSeconds.day } },
    );
  }

  async profile(id: UserEntity['id']) {
    logger.info(`Чтение профиля userId=${id}`);
    const user = await UserEntity.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [UserEntity],
    });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async register(dto: RegisterDto) {
    const isTempDomain = await this.redisService.get(redisTempMailKey(dto.email.split('@')[1] ?? ''));
    if (isTempDomain) {
      throw new BadRequestException('Registration on temporary email domain is now allowed');
    }

    const userWithSameEmail = await UserEntity.findOne({
      where: { email: dto.email },
    });
    if (userWithSameEmail) {
      throw new BadRequestException('User with this email already exists');
    }

    const created = await UserEntity.create({
      email: dto.email,
      name: dto.fullname,
      password: dto.password,
    });

    return this.profile(created.id);
  }

  async login(dto: LoginDto, ip?: string) {
    const { email, password } = dto;

    const user = await UserEntity.findOne({ where: { email } });

    if (!user) {
      this.saveLoginEvent({ ip, email, success: false, failReason: 'User does not exists' });
      throw new UnauthorizedException('User does not exists or password is wrong');
    }

    if (!(await compare(password, user.password))) {
      this.saveLoginEvent({ ip, email, success: false, failReason: 'Incorrect password' });
      throw new UnauthorizedException('User does not exists or password is wrong');
    }

    if (!user.isActive) {
      this.saveLoginEvent({ ip, email, success: false, failReason: 'User blocked' });
      throw new ForbiddenException();
    }

    const tokens = this.jwtService.makeTokenPair(user);
    await this.setNewRefreshToken(user.id, tokens.refreshToken);

    this.saveLoginEvent({ ip, email, success: true });

    return tokens;
  }

  private saveLoginEvent(event: Omit<LoginEvent, 'time' | 'ip'> & Partial<Pick<LoginEvent, 'ip'>>) {
    this.loginBuffer.push({
      ...event,
      time: new Date().toISOString(),
      ip: event.ip ?? 'unknown',
    });
  }

  async refresh(token: string) {
    const refreshTokenData = await this.redis.get(redisRefreshTokenKey(token));
    const valid = this.jwtService.verify(token, 'refresh');

    if (!valid || !refreshTokenData) {
      throw new UnauthorizedException();
    }

    const { userId } = this.jwtService.decode(token);

    const user = await this.profile(userId);

    const pair = this.jwtService.makeTokenPair(user);

    await this.redis.delete(redisRefreshTokenKey(token));
    await this.setNewRefreshToken(user.id, pair.refreshToken);

    return pair;
  }
}
