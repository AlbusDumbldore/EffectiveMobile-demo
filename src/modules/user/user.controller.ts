import { Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { validate } from '../../validation';
import { RegisterDto } from './dto';
import { UserService } from './user.service';

@injectable()
export class UserController {
  public readonly router = Router();

  constructor(
    @inject(UserService)
    private readonly service: UserService,
  ) {
    this.router.post('/register', (req: Request, res: Response) => this.register(req, res));
  }

  async register(req: Request, res: Response) {
    const body = validate(RegisterDto, req.body);

    const profile = await this.service.register(body);

    res.json(profile);
  }
}
