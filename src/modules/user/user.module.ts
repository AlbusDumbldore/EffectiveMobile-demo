import { ContainerModule } from 'inversify';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const UserModule = new ContainerModule(({ bind }) => {
  bind(UserService).toSelf().inSingletonScope();
  bind(UserController).toSelf().inSingletonScope();
});

export default UserModule;
