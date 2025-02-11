import express from 'express';
import {
    createTrip,
    getAllTrips,
    getTripById,
    updateTrip,
    deleteTrip,
    validateTrip,
} from '../controllers/tripController.js';

const router = express.Router();

// Create a new trip
router.post('/', validateTrip, createTrip);

// Get all trips
router.get('/', getAllTrips);

// Get a specific trip by ID
router.get('/trips/:tripId', getTripById);

// Update a trip by ID
router.patch('/:tripId', validateTrip, updateTrip);

// Delete a trip by ID
router.delete('/:tripId', deleteTrip);

export default router;