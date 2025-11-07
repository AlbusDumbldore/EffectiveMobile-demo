import { Router } from 'express';
import { inject, injectable } from 'inversify';
import { UserService } from './user.service';

@injectable()
export class UserController {
  public readonly router: Router;

  constructor(
    @inject(UserService)
    private readonly service: UserService,
  ) {
    this.router.post('/register', (req: Request, res: Response) => this.register(req, res));
  }
}
