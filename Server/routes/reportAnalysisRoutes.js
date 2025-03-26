import express from 'express';
import {
    getAllDriversReport,
    getDriverSummary,
    getAllMaintenanceReports,
    getTripSummary,
    getAllTripsReport,
    getVehicleSummary,
    getAllVehiclesReport
} from '../controllers/reportAnalysisController.js';

const router = express.Router();

// Driver reports routes
router.get('/drivers', getAllDriversReport);
router.get('/drivers/summary', getDriverSummary);

// Maintenance reports routes
router.get('/maintenance', getAllMaintenanceReports);

// Trip reports routes
router.get('/trips', getAllTripsReport);
router.get('/trips/summary', getTripSummary);

// Vehicle reports routes
router.get('/vehicles', getAllVehiclesReport);
router.get('/vehicles/summary', getVehicleSummary);

export default router;
