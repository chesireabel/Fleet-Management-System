import express from 'express';
import {
    validateMaintenance,
    validateId,
    createMaintenance,
    getAllMaintenances,
    getMaintenanceByVehicle,
    updateMaintenance,
    deleteMaintenance,
} from '../controllers/maintenanceController.js';

const router = express.Router();

// Routes
router.post('/', validateMaintenance, createMaintenance);
router.get('/', getAllMaintenances);
router.get('/vehicle/:vehicleId', validateId, getMaintenanceByVehicle);
router.put('/:maintenanceId', validateId, validateMaintenance, updateMaintenance);
router.delete('/:maintenanceId', validateId, deleteMaintenance);

export default router;