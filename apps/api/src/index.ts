import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import aiRoutes from './routes/ai.routes';
import dashboardRoutes from './routes/dashboard.routes';
import usersRoutes from './routes/users.routes';
import assignmentsRoutes from './routes/assignments.routes';
import messagesRoutes from './routes/messages.routes';

const app = express();
const PORT = process.env.API_PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, error: 'Too many requests' },
});
app.use('/api', limiter);

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, error: 'AI rate limit exceeded' },
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'EduSavvy AI API', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/messages', messagesRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🎓 EduSavvy AI API running on http://localhost:${PORT}`);
});

export default app;
