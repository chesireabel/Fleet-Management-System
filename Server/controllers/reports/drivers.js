import Driver from '../models/driver.js';

/**
 * Get all drivers with optional filters
 */
export const getAllDriversReport = async (req, res) => {
    try {
        const { status, minScore, maxScore } = req.query;
        let filter = {};

        // Filter by active status
        if (status) {
            filter.activeStatus = status.toLowerCase() === 'true';
        }

        // Filter by driving score range
        if (minScore || maxScore) {
            filter.drivingScore = {};
            if (minScore) filter.drivingScore.$gte = Number(minScore);
            if (maxScore) filter.drivingScore.$lte = Number(maxScore);
        }

        const drivers = await Driver.find(filter).populate('user', 'firstName lastName email');
        res.status(200).json({ success: true, count: drivers.length, data: drivers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching driver report', error: error.message });
    }
};

/**
 * Generate summary statistics for drivers
 */
export const getDriverSummary = async (req, res) => {
    try {
        const totalDrivers = await Driver.countDocuments();
        const activeDrivers = await Driver.countDocuments({ activeStatus: true });
        const inactiveDrivers = totalDrivers - activeDrivers;
        const averageDrivingScore = await Driver.aggregate([
            { $group: { _id: null, avgScore: { $avg: "$drivingScore" } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalDrivers,
                activeDrivers,
                inactiveDrivers,
                averageDrivingScore: averageDrivingScore.length ? averageDrivingScore[0].avgScore : 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error generating driver summary', error: error.message });
    }
};
