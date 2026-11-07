import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { healthRouter } from './modules/health/health.routes';
import { errorHandler, notFound } from './middleware/error-handler';

export const app = express();

// 1. security headers on every response
app.use(helmet());

// 2. only the frontend may call the API from a browser
app.use(cors({ origin: env.CORS_ORIGIN }));

// 3. parse JSON bodies, reject anything over 100kb
app.use(express.json({ limit: '100kb' }));

// 4. infrastructure route, not versioned
app.use('/health', healthRouter);

// 5. versioned API: feature routers are added here in later steps
const api = express.Router();
app.use('/api/v1', api);

// 6. must be last
app.use(notFound);
app.use(errorHandler);