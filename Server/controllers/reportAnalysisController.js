import ReportAnalysis from '../models/reportAnalysis.js';

// Utility function to handle errors
const handleError = (res, error, statusCode = 400) => {
    console.error(error.message); // Log the error to the console
    res.status(statusCode).json({ success: false, error: error.message });
};

// Create a report analysis
export const createReportAnalysis = async (req, res) => {
    try {
        const { reportType, startDate, endDate, totalTrips, totalDistance, totalFuelConsumed, totalMaintenanceCost, vehicleReports } = req.body;

        // Validate startDate and endDate
        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ success: false, error: 'End date must be greater than or equal to start date' });
        }

        const reportAnalysis = new ReportAnalysis({
            reportType,
            startDate,
            endDate,
            totalTrips,
            totalDistance,
            totalFuelConsumed,
            totalMaintenanceCost,
            vehicleReports,
        });

        await reportAnalysis.save();
        console.log(`Report analysis created: ${reportAnalysis._id}`); // Log to console
        res.status(201).json({ success: true, data: reportAnalysis });
    } catch (err) {
        handleError(res, err);
    }
};

// Get all report analyses
export const getAllReportAnalysis = async (req, res) => {
    try {
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reports = await ReportAnalysis.find()
            .populate('vehicleReports.vehicle')
            .skip(skip)
            .limit(limit);

        const totalRecords = await ReportAnalysis.countDocuments();

        res.status(200).json({
            success: true,
            data: reports,
            pagination: {
                page,
                limit,
                totalRecords,
                totalPages: Math.ceil(totalRecords / limit),
            },
        });
    } catch (err) {
        handleError(res, err);
    }
};

// Get a report analysis by ID
export const getReportAnalysisById = async (req, res) => {
    try {
        const { reportId } = req.params;

        const report = await ReportAnalysis.findById(reportId).populate('vehicleReports.vehicle');
        if (!report) {
            return res.status(404).json({ success: false, message: 'Report analysis not found' });
        }

        res.status(200).json({ success: true, data: report });
    } catch (err) {
        handleError(res, err);
    }
};

// Update a report analysis
export const updateReportAnalysis = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { reportType, startDate, endDate, totalTrips, totalDistance, totalFuelConsumed, totalMaintenanceCost, vehicleReports } = req.body;

        // Validate startDate and endDate
        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ success: false, error: 'End date must be greater than or equal to start date' });
        }

        const updatedReport = await ReportAnalysis.findByIdAndUpdate(
            reportId,
            { reportType, startDate, endDate, totalTrips, totalDistance, totalFuelConsumed, totalMaintenanceCost, vehicleReports },
            { new: true }
        );

        if (!updatedReport) {
            return res.status(404).json({ success: false, message: 'Report analysis not found' });
        }

        console.log(`Report analysis updated: ${reportId}`); // Log to console
        res.status(200).json({ success: true, data: updatedReport });
    } catch (err) {
        handleError(res, err);
    }
};

// Delete a report analysis
export const deleteReportAnalysis = async (req, res) => {
    try {
        const { reportId } = req.params;

        const deletedReport = await ReportAnalysis.findByIdAndDelete(reportId);

        if (!deletedReport) {
            return res.status(404).json({ success: false, message: 'Report analysis not found' });
        }

        console.log(`Report analysis deleted: ${reportId}`); // Log to console
        res.status(200).json({ success: true, message: 'Report analysis deleted successfully' });
    } catch (err) {
        handleError(res, err);
    }
};