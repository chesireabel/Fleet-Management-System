import MaintenanceRecord from ('../models/maintenance.js');

/**
 * Fetch all maintenance reports with filters & pagination
 */
const getAllMaintenanceReports = async (req, res) => {
    try {
        let { startDate, endDate, registrationNumber, service, page = 1, limit = 10 } = req.query;

        // Validate input dates
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        // Convert to Date objects and validate
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start) || isNaN(end)) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        // Adjust end date to include the full day
        end.setHours(23, 59, 59, 999);

        // Build query filters
        let filter = { date: { $gte: start, $lte: end } };
        if (registrationNumber) filter.registrationNumber = registrationNumber;
        if (service) filter.service = new RegExp(service, 'i'); // Case-insensitive search

        // Pagination settings
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;

        // Fetch maintenance records
        const reports = await MaintenanceRecord.find(filter).skip(skip).limit(pageSize);
        const totalRecords = await MaintenanceRecord.countDocuments(filter);

        if (reports.length === 0) {
            return res.status(200).json({ message: 'No maintenance reports found for the selected filters' });
        }

        // Summarize total maintenance cost
        const totalCost = reports.reduce((sum, record) => sum + (record.cost || 0), 0);

        // Structure the response
        return res.status(200).json({
            success: true,
            totalRecords,
            totalPages: Math.ceil(totalRecords / pageSize),
            currentPage: pageNumber,
            summary: { totalCost },
            tableData: reports.map(record => ({
                registrationNumber: record.registrationNumber,
                model: record.model,
                service: record.service,
                cost: record.cost,
                date: record.date.toISOString().split('T')[0]
            }))
        });
    } catch (error) {
        console.error('Error fetching maintenance reports:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getAllMaintenanceReports };
