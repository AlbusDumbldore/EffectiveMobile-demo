import { injectable } from 'inversify';
import { createClient, SetOptions } from 'redis';
import { appConfig } from '../config';
import logger from '../logger';

@injectable()
export class RedisService {
  private readonly redis = createClient({ url: appConfig.redisUrl });

  constructor() {
    this.connect();
  }

  async connect() {
    try {
      await this.redis.connect();
      logger.info('Successfully connected to Redis');
    } catch (err) {
      logger.error("Can't connect to Redis:");
      logger.error(err);
      throw err;
    }
  }

  async set(key: string, value: Record<string, any>, options?: SetOptions) {
    const json = JSON.stringify(value);

    return this.redis.set(key, json, options);
  }

  async get<T extends Record<string, any>>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);

    if (value === null) {
      return null;
    }

    return JSON.parse(value);
  }

  async delete(key: string) {
    return this.redis.del(key);
  }
}
