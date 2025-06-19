// server.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: 'https://salka-tech-service-request-form.vercel.app', // Your Vite frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: "Backend connected successfully!" });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/export', exportRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ⚠ AFTER all app.use() and app.use('/api/...')
app.use((err, req, res, next) => {
  console.error('🔥 UNCAUGHT ERROR:', err.stack || err);
  res.status(500).json({
    message: 'Internal server error',
    error: err.message || err,
  });
});
