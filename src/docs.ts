import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import { Router } from 'express';

const specPath = path.join(process.cwd(), 'docs', 'openapi.yaml');
const spec = YAML.parse(fs.readFileSync(specPath, 'utf8'));

export const docsRouter = Router();
docsRouter.use('/', swaggerUi.serve, swaggerUi.setup(spec));
