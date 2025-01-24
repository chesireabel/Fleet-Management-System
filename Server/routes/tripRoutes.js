import express from 'express';
import { createTrip, getAllTrips, getTripById, updateTrip, deleteTrip } from '../controllers/tripController';

const router = express.Router();

router.post('/', createTrip);

router.get('/', getAllTrips);

router.get('/:tripId', getTripById);

router.put('/:tripId', updateTrip);

router.delete('/:tripId', deleteTrip);

export default router;
