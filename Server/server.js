import express from 'express';
import cors from 'cors';

import vehicleRoutes from './routes/vehicleRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import maintenanceRoutes from './routes/maintenaceRoutes.js';
import reportAnalysisRoutes from './routes/reportAnalysisRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());


const PORT =  process.env.PORT || 3000;



//ROUTES
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/report-analyses', reportAnalysisRoutes);


app.use(errorHandler);


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
});