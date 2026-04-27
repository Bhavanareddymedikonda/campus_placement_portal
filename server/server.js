const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const matchingRoutes = require('./routes/matchingRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Connect to database
connectDB();

const app = express();

// CORS Configuration - Restricted to production frontend
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      // Production - Vercel Frontend
      'https://campus-placement-portal-iota.vercel.app',
      // Development - Local
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
    ];
    
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked request from origin: ${origin}`);
      callback(new Error('CORS policy: Origin not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Placement Portal API is running' });
});

// Global error handler - Production ready
app.use((err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  console.error(`❌ Error: ${err.message}`);
  if (isDevelopment) {
    console.error(err.stack);
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      ...(isDevelopment && { errors: err.errors }),
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      ...(isDevelopment && { details: err.message }),
    });
  }

  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      success: false,
      message: 'Database Error',
      ...(isDevelopment && { details: err.message }),
    });
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal Server Error',
    ...(isDevelopment && { 
      stack: err.stack,
      details: err,
    }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
