import Driver from '../models/driver.js';
import MaintenanceRecord from '../models/maintainence.js';
import Trip from '../models/trip.js';
import Vehicle from '../models/vehicle.js';

// Controller for getting all drivers report with optional filters
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

// Controller for generating driver summary
export const getDriverSummary = async (req, res) => {
    try {
        const totalDrivers = await Driver.countDocuments();
        const activeDrivers = await Driver.countDocuments({ activeStatus: true });
        const inactiveDrivers = totalDrivers - activeDrivers;
        const averageDrivingScore = await Driver.aggregate([{
            $group: { _id: null, avgScore: { $avg: "$drivingScore" } }
        }]);

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

// Controller for getting all maintenance reports with optional filters
/**
 * Fetch all maintenance reports with filters & pagination
 */
export const getAllMaintenanceReports = async (req, res) => {
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

        // Build query filters to check both serviceDate and nextServiceDate within the specified range
        let filter = {
            $or: [
                { serviceDate: { $gte: start, $lte: end } },   // Filter by serviceDate
                { nextServiceDate: { $gte: start, $lte: end } }  // Filter by nextServiceDate
            ]
        };

        if (registrationNumber) filter.registrationNumber = registrationNumber;
        if (service) filter.serviceType = new RegExp(service, 'i'); // Case-insensitive search

        // Pagination settings
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;

        // Fetch maintenance records with population of vehicle details
        const reports = await MaintenanceRecord.find(filter)
            .skip(skip)
            .limit(pageSize)
            .populate('vehicle', 'registrationNumber model');  // Populate vehicle data

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
                registrationNumber: record.vehicle ? record.vehicle.registrationNumber : 'N/A',
                model: record.vehicle ? record.vehicle.model : 'N/A',
                serviceType: record.serviceType,
                cost: record.cost,
                serviceDate: record.serviceDate.toISOString().split('T')[0],  // Format date to YYYY-MM-DD
                nextServiceDate: record.nextServiceDate ? record.nextServiceDate.toISOString().split('T')[0] : 'N/A',
                serviceCenter: record.serviceCenter || 'N/A',
                notes: record.notes || 'N/A',
            }))
        });
    } catch (error) {
        console.error('Error fetching maintenance reports:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Controller for getting all trips report with optional filters
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

// Controller for generating trip summary
export const getTripSummary = async (req, res) => {
    try {
        const totalTrips = await Trip.countDocuments();
        const completedTrips = await Trip.countDocuments({ tripStatus: 'Completed' });
        const cancelledTrips = await Trip.countDocuments({ tripStatus: 'Cancelled' });

        const aggregatedData = await Trip.aggregate([{
            $group: {
                _id: null,
                totalDistance: { $sum: "$distanceTraveled" },
                totalFuel: { $sum: "$fuelConsumption" },
                averageFuelEfficiency: { $avg: { $cond: [{ $gt: ["$distanceTraveled", 0] }, { $divide: ["$distanceTraveled", "$fuelConsumption"] }, 0] } }
            }
        }]);

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

// Controller for getting all vehicles report with optional filters
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

// Controller for generating vehicle summary
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
