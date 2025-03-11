import express from 'express';
import upload from '../config/multer.js';
import {
    createDriver,
    getAllDrivers,
    getDriverById,
    updateDriver,
    deleteDriver,
    validateDriver,
} from '../controllers/driverController.js';

const router = express.Router();

// Route to create a new driver
router.post('/', upload.single("profilePicture"),validateDriver, createDriver);

// Route to get all drivers (with pagination)
router.get('/', getAllDrivers);

// Route to get a specific driver by ID
router.get('/:driverId', getDriverById);

// Route to update a driver by ID
router.put('/:driverId', validateDriver, updateDriver);

// Route to delete a driver by ID
router.delete('/:driverId', deleteDriver);

export default router;