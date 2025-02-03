import express from 'express';
import { createMaintenance, getAllMaintenances, getMaintenanceByVehicle, updateMaintenance, deleteMaintenance } from '../controllers/maintenanceController.js';

const router = express.Router();

router.post('/', createMaintenance);

router.get('/', getAllMaintenances);

router.get('/vehicle/:vehicleId', getMaintenanceByVehicle);

router.put('/:maintenanceId', updateMaintenance);

router.delete('/:maintenanceId', deleteMaintenance);

export default router;
