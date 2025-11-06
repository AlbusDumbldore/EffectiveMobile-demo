import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { BadRequestException } from '../exceptions';

export const validate = <T extends object, V>(dto: ClassConstructor<T>, plain: V): T => {
  const instance = plainToInstance<T, V>(dto, plain);
  const errors = validateSync(instance, { whitelist: true, stopAtFirstError: true });

  if (errors.length) {
    const [{ constraints }] = errors;

    if (constraints) {
      throw new BadRequestException(Object.values(constraints)[0]);
    }

    throw new BadRequestException('Unknown validation error');
  }

  return instance;
};
