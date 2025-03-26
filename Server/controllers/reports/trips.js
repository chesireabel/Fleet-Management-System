import Trip from '../models/trip.js';

/**
 * Get all trips with optional filters
 */
export const getAllTripsReport = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;
        let filter = {};

        // Filter by trip status
        if (status) {
            filter.tripStatus = status;
        }

        // Filter by date range
        if (startDate || endDate) {
            filter.scheduledDate = {};
            if (startDate) filter.scheduledDate.$gte = new Date(startDate);
            if (endDate) filter.scheduledDate.$lte = new Date(endDate);
        }

        const trips = await Trip.find(filter)
            .populate('vehicle', 'registrationNumber make model')
            .populate('driver', 'licenseNumber user')
            .sort({ scheduledDate: -1 });

        res.status(200).json({ success: true, count: trips.length, data: trips });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching trip report', error: error.message });
    }
};

/**
 * Generate summary statistics for trips
 */
export const getTripSummary = async (req, res) => {
    try {
        const totalTrips = await Trip.countDocuments();
        const completedTrips = await Trip.countDocuments({ tripStatus: 'Completed' });
        const cancelledTrips = await Trip.countDocuments({ tripStatus: 'Cancelled' });

        const aggregatedData = await Trip.aggregate([
            {
                $group: {
                    _id: null,
                    totalDistance: { $sum: "$distanceTraveled" },
                    totalFuel: { $sum: "$fuelConsumption" },
                    averageFuelEfficiency: { $avg: { $cond: [{ $gt: ["$distanceTraveled", 0] }, { $divide: ["$distanceTraveled", "$fuelConsumption"] }, 0] } }
                }
            }
        ]);

        const summary = aggregatedData.length ? aggregatedData[0] : { totalDistance: 0, totalFuel: 0, averageFuelEfficiency: 0 };

        res.status(200).json({
            success: true,
            data: {
                totalTrips,
                completedTrips,
                cancelledTrips,
                totalDistance: summary.totalDistance,
                totalFuel: summary.totalFuel,
                averageFuelEfficiency: summary.averageFuelEfficiency
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error generating trip summary', error: error.message });
    }
};
