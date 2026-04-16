require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { connectRedis } = require('./config/redis');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_POS_URL || 'http://localhost:3000',
      process.env.FRONTEND_ECOM_URL || 'http://localhost:3001',
    ],
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_POS_URL || 'http://localhost:3000',
    process.env.FRONTEND_ECOM_URL || 'http://localhost:3001',
  ],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});

// Attach socket.io to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1', apiLimiter, routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Socket.io events
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('join-store', (storeId) => {
    socket.join(`store-${storeId}`);
    console.log(`📍 Socket ${socket.id} joined store-${storeId}`);
  });

  socket.on('join-zone', (zoneId) => {
    socket.join(`zone-${zoneId}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectRedis();
  
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.io enabled`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();

module.exports = { app, io };
