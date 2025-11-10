import { ContainerModule } from 'inversify';
import { JwtService } from './jwt.service';

const JwtModule = new ContainerModule(({ bind }) => {
  bind(JwtService).toSelf().inSingletonScope();
});

export default JwtModule;
