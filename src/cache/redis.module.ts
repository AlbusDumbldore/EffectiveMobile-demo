import { ContainerModule } from 'inversify';
import { RedisService } from './redis.service';

const RedisModule = new ContainerModule(({ bind }) => {
  bind(RedisService).toSelf().inSingletonScope();
});

export default RedisModule;
