import { Express } from 'express';
import { readFileSync } from 'fs';
import swaggerUi from 'swagger-ui-express';
import { parse } from 'yaml';

export const setupSwagger = (server: Express) => {
  let file = readFileSync('./src/swagger/swagger.yml', 'utf8');
  file = file.replace('1.0.0', process.env.npm_package_version ?? '1');

  const swaggerDocument = parse(file);

  for (const pathName in swaggerDocument.paths) {
    const path = swaggerDocument.paths[pathName];

    for (const method in path) {
      const responses = path[method].responses ?? {};

      if (!('200' in responses)) {
        responses['200'] = { description: '' };
      }

      path[method].responses = responses;
    }
  }

  server.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
