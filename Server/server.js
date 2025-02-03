import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB  from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import maintenanceRoutes from './routes/maintenaceRoutes.js';
import reportAnalysisRoutes from './routes/reportAnalysisRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();


const app = express();
app.use(express.json());
app.use(cors());


const PORT =  process.env.PORT || 3000;


connectDB();

app.get('/',(req, res) => { 
    res.json({hello:"ABEL"});
});

//ROUTES
app.use('/users',userRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/drivers', driverRoutes);
app.use('/trips', tripRoutes);
app.use('/maintenance', maintenanceRoutes);
app.use('/reportanalysis', reportAnalysisRoutes);


app.use(errorHandler);


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
});