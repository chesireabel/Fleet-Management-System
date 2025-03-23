// routes/reportRoutes.js
import express from 'express';
import { generateReport } from '../controllers/reportAnalysisController.js';

const router = express.Router();

// GET /api/reports
router.get(
    '/',
    generateReport
);

// GET /api/reports/:id
router.get('/:id', async (req, res) => {
    try {
        const report = await BaseReport.findById(req.params.id)
            .populate('metadata.requestedBy', 'name email')
            .lean();

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json(report);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;