import { Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { validate } from '../../validation';
import { LoginDto, RegisterDto, TokenDto } from './dto';
import { UserService } from './user.service';

@injectable()
export class UserController {
  public readonly router = Router();

  constructor(
    @inject(UserService)
    private readonly service: UserService,
  ) {
    this.router.post('/register', (req: Request, res: Response) => this.register(req, res));
    this.router.post('/login', (req: Request, res: Response) => this.login(req, res));
    this.router.post('/refresh', (req: Request, res: Response) => this.refresh(req, res));
  }

  async register(req: Request, res: Response) {
    const body = validate(RegisterDto, req.body);

    const profile = await this.service.register(body);

    res.json(profile);
  }

  async login(req: Request, res: Response) {
    const body = validate(LoginDto, req.body);

    const tokens = await this.service.login(body, req.ip);

    res.json(tokens);
  }

  async refresh(req: Request, res: Response) {
    const { token } = validate(TokenDto, req.body);

    const tokens = await this.service.refresh(token);

    res.json(tokens);
  }
}
