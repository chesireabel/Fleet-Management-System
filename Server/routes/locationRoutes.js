import { Router } from 'express';
const router = Router();
import { createLocation, getLocations, getLocationByVehicle } from '../controllers/locationController';

// Route to create a new location entry (POST)
router.post('/', createLocation);

// Route to get all locations (GET)
router.get('/', getLocations);

// Route to get the latest location for a specific vehicle (GET)
router.get('/vehicle/:vehicleId', getLocationByVehicle);

export default router;
