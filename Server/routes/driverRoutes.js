
import upload from '../config/multer.js';
import express from 'express';
import {
    validateDriver,
    createDriver,
    getAllDrivers,
    getAllDriversWithoutPagination,
    getDriverById,
    updateDriver,
    deleteDriver
    
} from '../controllers/driverController.js';

const router = express.Router();

// Existing routes
router.post('/', upload.single("profilePicture"),validateDriver, createDriver);
router.get('/', getAllDrivers); // Get all drivers
router.get('/all', getAllDriversWithoutPagination);
router.get('/:driverId', getDriverById); // Get a specific driver by ID
router.patch('/:driverId', validateDriver, updateDriver); // Update a driver
router.delete('/:driverId', deleteDriver); // Delete a driver



export default router;