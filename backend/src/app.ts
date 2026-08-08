import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { sendSuccess, sendError } from './utils/response';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (_req, res) => {
  return sendSuccess(res, undefined, 'API is running');
});

// 404 Handler for undefined routes
app.use((req, res) => {
  return sendError(res, `Route ${req.method} ${req.path} not found`, 404, 'NOT_FOUND');
});

// Central Error Handling Middleware
app.use(errorHandler);

export default app;
