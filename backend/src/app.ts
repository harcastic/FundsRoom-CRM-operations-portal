import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { checkDatabaseConnection } from './config/database';
import { sendSuccess, sendError } from './utils/response';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import productRoutes from './routes/product.routes';

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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);

// Health Check Endpoint
app.get('/api/health', async (_req, res) => {
  const dbConnected = await checkDatabaseConnection();
  return sendSuccess(
    res,
    { dbConnected, environment: env.NODE_ENV },
    'API is running'
  );
});

// 404 Handler for undefined routes
app.use((req, res) => {
  return sendError(res, `Route ${req.method} ${req.path} not found`, 404, 'NOT_FOUND');
});

// Central Error Handling Middleware
app.use(errorHandler);

export default app;
