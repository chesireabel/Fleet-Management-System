import express from 'express';
import { createIncidentReport,getIncidentReports,getDriverIncidentReports } from '../controllers/incidentReport.js';
import { authenticate } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Route to create a new incident report
router.post('/', authenticate,createIncidentReport);
router.get('/reports',authenticate, getIncidentReports);
router.get('/driver-reports',authenticate,getDriverIncidentReports)

export default router;
