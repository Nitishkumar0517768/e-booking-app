const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./src/config/db');

// Route Handlers
const authRoutes = require('./src/routes/authRoutes');
const resourceRoutes = require('./src/routes/resourceRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'e-Booking API is running successfully',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root API Endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to e-Booking API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      resources: '/api/resources',
      bookings: '/api/bookings',
      notifications: '/api/notifications',
      admin: '/api/admin',
    },
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const { execSync } = require('child_process');

const freePort = (port) => {
  try {
    if (process.platform === 'win32') {
      execSync(
        `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -ne ${process.pid} } | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`,
        { stdio: 'ignore' }
      );
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: 'ignore' });
    }
  } catch (e) {
    // Ignore error if port is already free
  }
};

// Start Server with Auto-Port Conflict Resolution
const startServer = async (isRetry = false) => {
  if (!isRetry) {
    await connectDB();
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] e-Booking Backend running on port ${PORT}`);
    console.log(`[Server] Health Check available at http://localhost:${PORT}/api/health`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && !isRetry) {
      console.warn(`[Server] Port ${PORT} is currently occupied by a previous process. Auto-freeing port...`);
      freePort(PORT);
      setTimeout(() => {
        startServer(true);
      }, 1000);
      return;
    }

    if (err.code === 'EADDRINUSE') {
      console.error(`\n[Server Notice] Port ${PORT} is still in use after auto-free.`);
      console.error(`Run "npm run kill-port" in backend folder to free it manually.\n`);
    } else {
      console.error('[Server Error]:', err);
    }
    process.exit(1);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
