import { Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { IdNumberDto, PaginationDto } from '../../common';
import { JwtAllowBlockedGuard, JwtGuard, RoleGuard } from '../../guards';
import { JwtService } from '../../jwt/jwt.service';
import { validate } from '../../validation';
import { LoginDto, RegisterDto, TokenDto } from './dto';
import { UserService } from './user.service';
import { UserRole } from './user.types';

@injectable()
export class UserController {
  public readonly router = Router();

  constructor(
    @inject(UserService)
    private readonly service: UserService,
    @inject(JwtService)
    private readonly jwtService: JwtService,
  ) {
    const authentication = JwtGuard(this.jwtService);
    const authorization = [authentication, RoleGuard(UserRole.admin)];

    const allowBlocked = JwtAllowBlockedGuard(this.jwtService);

    this.router.post('/register', (req: Request, res: Response) => this.register(req, res));
    this.router.post('/login', (req: Request, res: Response) => this.login(req, res));
    this.router.post('/refresh', (req: Request, res: Response) => this.refresh(req, res));
    this.router.post('/logout', authentication, (req: Request, res: Response) => this.logout(req, res));

    this.router.get('/profile', authentication, (req: Request, res: Response) => this.profile(req, res));
    this.router.post('/me/block', authentication, (req: Request, res: Response) => this.blockSelf(req, res));
    this.router.post('/me/unblock', allowBlocked, (req: Request, res: Response) => this.unblockSelf(req, res));

    // Admin methods.
    this.router.get('/:id', ...authorization, (req: Request, res: Response) => this.profileAdmin(req, res));
    this.router.get('/', ...authorization, (req: Request, res: Response) => this.list(req, res));
    this.router.post('/:id/block', ...authorization, (req: Request, res: Response) => this.blockUser(req, res));
    this.router.post('/:id/unblock', ...authorization, (req: Request, res: Response) => this.unblockUser(req, res));
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

  async profile(req: Request, res: Response) {
    const {
      user: { id },
    } = res.locals;
    const result = await this.service.profile(id);

    res.json(result);
  }

  async profileAdmin(req: Request, res: Response) {
    const { id } = validate(IdNumberDto, req.params);
    const result = await this.service.profile(id);

    res.json(result);
  }

  async list(req: Request, res: Response) {
    const payload = validate(PaginationDto, req.query);

    const result = await this.service.getAllUsers(payload);

    res.json(result);
  }

  async blockUser(req: Request, res: Response) {
    const { id } = validate(IdNumberDto, req.params);

    const result = await this.service.blockOrUnblockUser(id, false);

    res.json(result);
  }

  async unblockUser(req: Request, res: Response) {
    const { id } = validate(IdNumberDto, req.params);

    const result = await this.service.blockOrUnblockUser(id, true);

    res.json(result);
  }

  async blockSelf(req: Request, res: Response) {
    const {
      user: { id },
    } = res.locals;

    const result = await this.service.blockOrUnblockUser(id, false);

    res.json(result);
  }

  async unblockSelf(req: Request, res: Response) {
    const {
      user: { id },
    } = res.locals;

    const result = await this.service.blockOrUnblockUser(id, true);

    res.json(result);
  }

  async refresh(req: Request, res: Response) {
    const { token } = validate(TokenDto, req.body);

    const tokens = await this.service.refresh(token);

    res.json(tokens);
  }

  async logout(req: Request, res: Response) {
    const { token } = validate(TokenDto, req.body);
    await this.service.logout(token);

    res.json({ result: true });
  }
}
