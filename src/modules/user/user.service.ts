import axios from 'axios';
import { CronJob } from 'cron';
import { inject, injectable } from 'inversify';
import { redisTempMailKey } from '../../cache/redis.keys';
import { RedisService } from '../../cache/redis.service';
import { TimeInSeconds } from '../../common';
import { UserEntity } from '../../database/entities/user.entity';
import { BadRequestException, NotFoundException } from '../../exceptions';
import logger from '../../logger';
import { RegisterDto } from './dto';

@injectable()
export class UserService {
  private readonly refreshTempDomainsJob = new CronJob('0 */6 * * *', () => this.loadTmpDomains(), null, true);
  constructor(@inject(RedisService) private readonly redisService: RedisService) {
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
}
