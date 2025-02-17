import express from 'express';
import {
    createMaintenance,
    getAllMaintenances,
    getMaintenanceByVehicle,
    updateMaintenance,
    deleteMaintenance,
    validateMaintenance,
} from '../controllers/maintenanceController.js';

const router = express.Router();

// Routes (without authentication)
router.post('/', validateMaintenance, createMaintenance);
router.get('/', getAllMaintenances);
router.get('/vehicle/:vehicleId', getMaintenanceByVehicle);
router.put('/:maintenanceId', validateMaintenance, updateMaintenance);
router.delete('/:maintenanceId', deleteMaintenance);

export default router;