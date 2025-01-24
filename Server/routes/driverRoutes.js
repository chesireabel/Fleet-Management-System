import { Router } from 'express';
const router = Router();
import { createDriver, getDrivers, getDriverById } from '../controllers/driverController';

// Route to create a new driver
router.post('/', createDriver);

// Route to get all drivers
router.get('/', getDrivers);

// Route to get a driver by ID
router.get('/:id', getDriverById);

export default router;
