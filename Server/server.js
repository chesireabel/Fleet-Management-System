import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import maintenaceRoutes from './routes/maintenaceRoutes.js';
import reportAnalysisRoutes from './routes/reportAnalysisRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:5173", 
    methods: "GET,POST,PUT,DELETE",
    credentials: true
  }));

  app.use(express.json()); // Parse JSON request bodies

// Database connection
connectDB();

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Fleet Management API' });
});

// API Routes
app.use('/uploads', express.static('uploads'));
app.use('/users', userRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/drivers', driverRoutes);
app.use('/trips', tripRoutes);
app.use('/maintenance', maintenaceRoutes);
app.use('/reportanalysis', reportAnalysisRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});