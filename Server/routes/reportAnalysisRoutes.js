import express from 'express';
import { createReportAnalysis, getAllReportAnalysis, getReportAnalysisById, updateReportAnalysis, deleteReportAnalysis } from '../controllers/reportAnalysisController.js';

const router = express.Router();

router.post('/', createReportAnalysis);

router.get('/', getAllReportAnalysis);

router.get('/:reportId', getReportAnalysisById);

router.put('/:reportId', updateReportAnalysis);

router.delete('/:reportId', deleteReportAnalysis);

export default router;
