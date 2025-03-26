import Vehicle from '../models/vehicle.js';

/**
 * Get all vehicles with optional filters
 */
export const getAllVehiclesReport = async (req, res) => {
    try {
        const { status, health, insuranceExpired } = req.query;
        let filter = {};

        // Filter by active status
        if (status) {
            filter.activeStatus = status.toLowerCase() === 'true';
        }

        // Filter by vehicle health
        if (health) {
            filter.vehicleHealth = health;
        }

        // Filter by insurance expiry
        if (insuranceExpired === 'true') {
            const today = new Date();
            filter['insuranceDetails.expiryDate'] = { $lt: today };
        }

        const vehicles = await Vehicle.find(filter);
        res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching vehicle report', error: error.message });
    }
};

/**
 * Generate summary statistics for vehicles
 */
export const getVehicleSummary = async (req, res) => {
    try {
        const totalVehicles = await Vehicle.countDocuments();
        const activeVehicles = await Vehicle.countDocuments({ activeStatus: true });
        const inactiveVehicles = totalVehicles - activeVehicles;
        const vehicleHealthStats = await Vehicle.aggregate([
            { $group: { _id: '$vehicleHealth', count: { $sum: 1 } } }
        ]);
        const expiredInsuranceCount = await Vehicle.countDocuments({
            'insuranceDetails.expiryDate': { $lt: new Date() }
        });

        res.status(200).json({
            success: true,
            data: {
                totalVehicles,
                activeVehicles,
                inactiveVehicles,
                expiredInsuranceCount,
                vehicleHealthStats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error generating summary report', error: error.message });
    }
};
