import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import { env } from './config/env';
import { docsRouter } from './docs';
import { healthRouter } from './modules/health/health.routes';
import { requestId } from './middleware/request-id';
import { requestLogger } from './middleware/request-logger';
import { noStore } from './middleware/cache';
import { errorHandler, notFound } from './middleware/error-handler';

export const app = express();

// behind Nginx: trust exactly one proxy hop, so req.ip is the real client IP
app.set('trust proxy', 1);

// 0. trace id + log line for every request (first, so even errors get an id)
app.use(requestId);
app.use(requestLogger);

// 1. Swagger UI — helmet with CSP disabled, because CSP blocks Swagger's inline scripts
app.use('/docs', helmet({ contentSecurityPolicy: false }), docsRouter);

// 2. security headers on every response
app.use(helmet());

// 3. only the frontend may call the API; let it read ETag, trace id and rate-limit headers
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    exposedHeaders: ['ETag', 'X-Request-Id', 'RateLimit', 'RateLimit-Policy'],
  }),
);

// 4. never cache by default; read routes opt into privateCache
app.use(noStore);

// 5. parse JSON bodies, reject anything over 100kb
app.use(express.json({ limit: '100kb' }));

// 6. infrastructure route, not versioned
app.use('/health', healthRouter);

// 7. versioned API: feature routers are added here in later steps
const api = express.Router();
app.use('/api/v1', api);

// 8. must be last
app.use(notFound);
app.use(errorHandler);
