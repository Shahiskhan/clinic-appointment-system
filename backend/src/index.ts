import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import { prisma } from './lib/prisma.js';

import doctorRoutes from './routes/doctorRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { ensureAdmin } from './controllers/authController.js';

const app = express();

// Security & Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: ENV.FRONTEND_URL.split(',').map(origin => origin.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-sfpy-signature', 'x-safepay-signature'],
  })
);
app.use(morgan('dev'));

// Body Parser with rawBody preservation for Webhook signatures
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (err: any) {
    dbStatus = `unreachable (${err.message})`;
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'MediCare+ Hybrid Clinic API',
    database: dbStatus,
    paymentGateways: {
      safepay: {
        environment: 'sandbox',
        endpoint: ENV.SAFEPAY_BASE_URL,
        webhookConfigured: !!ENV.SAFEPAY_WEBHOOK_SECRET,
      },
      payfast: {
        environment: ENV.PAYFAST_ENV,
        merchantId: ENV.PAYFAST_MERCHANT_ID,
        ipnConfigured: !!ENV.PAYFAST_IPN_URL,
      },
    },
  });
});

app.get('/api/health', async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (err: any) {
    dbStatus = `unreachable (${err.message})`;
  }


  res.json({ status: 'ok', database: dbStatus });
});

// Mount Routes
app.use('/api/doctors', doctorRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/auth', authRoutes);

// Root Welcome
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to MediCare+ Hybrid Clinic Management API',
    version: '1.0.0',
    documentation: '/api/*',
    health: '/health',
  });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.url}`,
  });
});

const PORT = parseInt(ENV.PORT, 10) || 5000;

let server: ReturnType<typeof app.listen>;

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();
    await ensureAdmin();
    server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 MediCare+ Hybrid Clinic Backend Server Running`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🩺 Health: http://localhost:${PORT}/health`);
      console.log(`💳 Gateways: Safepay Pakistan & PayFast Pakistan`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Backend startup failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

void startServer();

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received...');
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
});

export default app;
