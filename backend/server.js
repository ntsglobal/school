import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import socketService from './services/socketService.js';

// Import database connection
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import courseRoutes from './routes/courses.js';
import lessonRoutes from './routes/lessons.js';
import progressRoutes from './routes/progress.js';
import gamificationRoutes from './routes/gamification.js';
import liveClassRoutes from './routes/liveClasses.js';
import chatRoutes from './routes/chat.js';
import assessmentRoutes from './routes/assessments.js';
import badgeRoutes from './routes/badges.js';
import goalRoutes from './routes/goals.js';
import speechRoutes from './routes/speech.js';
import languageRoutes from './routes/languages.js';
import culturalContentRoutes from './routes/culturalContent.js';
import communityRoutes from './routes/community.js';
import certificationRoutes from './routes/certifications.js';
import buddyRoutes from './routes/buddies.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';
import { apiSecurity } from './middleware/security.js';
import { sanitizeInput } from './middleware/validation.js';

// Load environment variables
dotenv.config();

// Initialize Firebase after environment variables are loaded
import { initializeFirebase } from './config/firebase.js';
initializeFirebase();

const app = express();
const server = createServer(app);

// Initialize Socket.io service
socketService.initialize(server);

// Connect to MongoDB
connectDB();

// HTTPS redirect in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Security middleware (must be applied early)
app.use(apiSecurity);
app.use(sanitizeInput);
app.use(compression());

// Rate limiting (apply to all API routes)
app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Make socketService accessible to routes  
app.set('socketService', socketService);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/liveClasses', liveClassRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/speech', speechRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/cultural-content', culturalContentRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/buddies', buddyRoutes);

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'NTS Language Learning API is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// Database health check
app.get('/api/health/db', async (req, res) => {
  try {
    const mongoose = await import('mongoose');
    await mongoose.connection.db.admin().ping();
    res.json({ 
      database: 'connected',
      readyState: mongoose.connection.readyState,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      database: 'disconnected', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Cache statistics endpoint (admin only)
app.get('/api/admin/cache-stats', async (req, res) => {
  try {
    const { getCacheStats } = await import('./utils/cache.js');
    res.json({
      cacheStats: getCacheStats(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Cache stats not available',
      message: error.message 
    });
  }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 NTS Language Learning Platform API`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
