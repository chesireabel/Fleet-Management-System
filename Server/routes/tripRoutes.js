import express from 'express';
import {
    createTrip,
    completeTrip,
    getAllTrips,
    getDriverTrips,
    getTripById,
    updateTrip,
    deleteTrip,
    validateTrip,
} from '../controllers/tripController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Manager-only routes
 * These routes require the authenticated user to have the "fleet_manager" role.
 */
router.post('/', authenticate, authorize('fleet_manager'), validateTrip, createTrip); // Create a new trip
router.get('/', authenticate, authorize(['fleet_manager','driver']), getAllTrips); // Get all trips with pagination
router.get('/:tripId', authenticate, authorize(['fleet_manager','driver']), getTripById); // Get a specific trip by ID
router.patch('/:tripId', authenticate, authorize('fleet_manager'), validateTrip, updateTrip); // Update a trip record (partial updates)
router.delete('/:tripId', authenticate, authorize('fleet_manager'), deleteTrip); // Delete a trip record

/**
 * Driver-only route
 * This route allows a driver to mark a trip as completed.
 */
router.get('/my-trips', authenticate, authorize('driver'), getDriverTrips); 
router.put('/:tripId/complete', authenticate, authorize('driver'), completeTrip); // Complete a trip

export default router;
