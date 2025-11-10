export class ForbiddenException extends Error {
  public readonly code = 403;

  constructor(message = 'Forbidden') {
    super(message);
  }
}
