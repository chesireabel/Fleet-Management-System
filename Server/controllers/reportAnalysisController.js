import ReportAnalysis from '../models/reportAnalysis';

export const createReportAnalysis = async (req, res) => {
    try {
        const { reportType, startDate, endDate, totalTrips, totalDistance, totalFuelConsumed, totalMaintenanceCost, vehicleReports } = req.body;

        const reportAnalysis = new ReportAnalysis({
            reportType,
            startDate,
            endDate,
            totalTrips,
            totalDistance,
            totalFuelConsumed,
            totalMaintenanceCost,
            vehicleReports
        });

        await reportAnalysis.save();
        res.status(201).json(reportAnalysis); 
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getAllReportAnalysis = async (req, res) => {
    try {
        const reports = await ReportAnalysis.find().populate('vehicleReports.vehicle');
        res.status(200).json(reports); 
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getReportAnalysisById = async (req, res) => {
    try {
        const { reportId } = req.params;

        const report = await ReportAnalysis.findById(reportId).populate('vehicleReports.vehicle');
        if (!report) {
            return res.status(404).json({ message: 'Report analysis not found' });
        }

        res.status(200).json(report);  
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const updateReportAnalysis = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { reportType, startDate, endDate, totalTrips, totalDistance, totalFuelConsumed, totalMaintenanceCost, vehicleReports } = req.body;

        const updatedReport = await ReportAnalysis.findByIdAndUpdate(
            reportId,
            { reportType, startDate, endDate, totalTrips, totalDistance, totalFuelConsumed, totalMaintenanceCost, vehicleReports },
            { new: true }  
        );

        if (!updatedReport) {
            return res.status(404).json({ message: 'Report analysis not found' });
        }

        res.status(200).json(updatedReport);  
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteReportAnalysis = async (req, res) => {
    try {
        const { reportId } = req.params;

        const deletedReport = await ReportAnalysis.findByIdAndDelete(reportId);

        if (!deletedReport) {
            return res.status(404).json({ message: 'Report analysis not found' });
        }

        res.status(200).json({ message: 'Report analysis deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
