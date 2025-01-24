import express from 'express';
import { createVehicle, getAllVehicles, getVehicleById, updateVehicle, deleteVehicle } from '../controllers/vehicleController';

const router = express.Router();

router.post('/', createVehicle);

router.get('/', getAllVehicles);

router.get('/:vehicleId', getVehicleById);

router.put('/:vehicleId', updateVehicle);

router.delete('/:vehicleId', deleteVehicle);

export default router;
