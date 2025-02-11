import express from 'express';
import {
    createVehicle,
    getAllVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle,
    validateVehicle,
} from '../controllers/vehicleController.js';

const router = express.Router();

// Routes
router.post('/', validateVehicle, createVehicle);
router.get('/', getAllVehicles);
router.get('/:vehicleId', getVehicleById);
router.put('/:vehicleId', validateVehicle, updateVehicle);
router.delete('/:vehicleId', deleteVehicle);

export default router;