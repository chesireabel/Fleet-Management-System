import { body, validationResult } from 'express-validator';
import Trip from '../models/trip.js';
import Driver from '../models/driver.js';
import Vehicle from '../models/vehicle.js';

// Reusable error handler
const handleError = (res, statusCode, message) => {
    res.status(statusCode).json({
        status: statusCode >= 500 ? 'error' : 'fail',
        message,
    });
};

// Middleware to validate trip data (for creating a trip)
export const validateTrip = [
    body('vehicle').notEmpty().withMessage('Vehicle ID is required').isMongoId().withMessage('Invalid vehicle ID'),
    body('driver').notEmpty().withMessage('Driver ID is required').isMongoId().withMessage('Invalid driver ID'),
    body('startLocation').notEmpty().withMessage('Start location is required'),
    body('endLocation').notEmpty().withMessage('End location is required'),
    body('scheduledDate').notEmpty().withMessage('Scheduled date is required').isISO8601().withMessage('Invalid scheduled date (ISO8601 required)'),
    body('startTime').optional().isISO8601().withMessage('Invalid start time (ISO8601 required)'),
    body('endTime').optional().isISO8601().withMessage('Invalid end time (ISO8601 required)')
    .custom((value, { req }) => {
        if (req.body.startTime && value) { 
            if (new Date(value) <= new Date(req.body.startTime)) {
                throw new Error('End time must be after start time');
            }
        }
        return true;
    }),
    body('distanceTraveled').optional().isFloat({ min: 0 }).withMessage('Distance must be a positive number'),
    body('fuelConsumption').optional().isFloat({ min: 0 }).withMessage('Fuel consumption must be a positive number'),
    body('tripStatus').optional().isIn(['Completed', 'In Progress', 'Cancelled']).withMessage('Invalid trip status'),
];

// Middleware for updating trip data (optional fields)
export const validateTripUpdate = [
    body('startTime').optional().isISO8601().withMessage('Invalid start time (ISO8601 required)'),
    body('endTime').optional().isISO8601().withMessage('Invalid end time (ISO8601 required)'),
    body('tripStatus').optional().isIn(['Completed', 'In Progress', 'Cancelled']).withMessage('Invalid trip status'),
    body().custom((value, { req }) => {
        const allowedFields = ['startTime', 'endTime', 'tripStatus', 'distanceTraveled', 'fuelConsumption'];
        const invalidFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
        if (invalidFields.length > 0) {
            throw new Error(`Invalid fields: ${invalidFields.join(', ')}`);
        }
        return true;
    }),
];

// Create a new trip (Manager-only)
export const createTrip = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return handleError(res, 400, errors.array().map(err => err.msg).join('. '));

        const { driver, vehicle, startLocation, endLocation, scheduledDate } = req.body;

        // Validate driver and vehicle
        const [foundVehicle, foundDriver] = await Promise.all([
            Vehicle.findById(vehicle).lean(),
            Driver.findById(driver).lean(),
        ]);

        if (!foundVehicle || !foundDriver) return handleError(res, 404, 'Vehicle or Driver not found');

        // Create the trip
        const trip = new Trip({ 
            driver: foundDriver,
             vehicle,
             startLocation,
             endLocation,
             scheduledDate });
        await trip.save();

        res.status(201).json({ status: 'success', data: { trip } });
    } catch (err) {
        console.error('Error creating trip:', err);
        handleError(res, 500, 'Internal server error');
    }
};

// Complete a trip (Driver-only)
export const completeTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { startTime, endTime, distanceTraveled, fuelConsumption } = req.body;

        // Check required fields
        if (!startTime || !endTime || distanceTraveled === undefined || fuelConsumption === undefined) {
            return handleError(res, 400, 'Missing required fields: startTime, endTime, distanceTraveled, fuelConsumption');
        }

        // Find and validate trip
        const trip = await Trip.findById(tripId);
        if (!trip) return handleError(res, 404, 'Trip not found');
        if (trip.tripStatus === 'Completed') {
            return handleError(res, 400, 'Trip is already completed');
        }

        // Validate times
        const start = new Date(startTime);
        const end = new Date(endTime);
        if (isNaN(start) || isNaN(end) || end <= start) {
            return handleError(res, 400, 'Invalid start or end time');
        }

        // Validate numerical values
        const distance = Number(distanceTraveled);
        const fuel = Number(fuelConsumption);
        if (isNaN(distance) || distance < 0 || isNaN(fuel) || fuel < 0) {
            return handleError(res, 400, 'Invalid distance or fuel value');
        }

        // Calculate time difference in hours
        const timeDiffHours = (end - start) / 3600000;
        if (timeDiffHours <= 0) {
            return handleError(res, 400, 'End time must be after start time');
        }

        // Update trip
        trip.startTime = startTime;
        trip.endTime = endTime;
        trip.distanceTraveled = distance;
        trip.fuelConsumption = fuel;
        trip.tripStatus = 'Completed';

        // Update driver metrics
        const driver = await Driver.findById(trip.driver);
        if (!driver) return handleError(res, 404, 'Driver not found');

        // Calculate average speed
        const averageSpeed = distance / timeDiffHours;

        // Update driver's performance
        driver.performanceMetrics.totalTrips += 1;
        driver.performanceMetrics.totalDistance += distance;
        driver.performanceMetrics.totalFuelConsumed += fuel;
        driver.performanceMetrics.averageSpeed = 
            ((driver.performanceMetrics.averageSpeed * (driver.performanceMetrics.totalTrips - 1)) + averageSpeed) / 
            driver.performanceMetrics.totalTrips;

        await Promise.all([trip.save(), driver.save()]);

        res.status(200).json({ status: 'success', data: { trip, driver } });
    } catch (err) {
        console.error('Error completing trip:', err);
        handleError(res, 500, 'Internal server error');
    }
};

export const getAllTrips = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const totalTrips = await Trip.countDocuments();
        const trips = await Trip.find()
            .populate({path :'vehicle',
                      select: 'registrationNumber'})
            .populate({path :'driver',
                populate:{
                     path:'user',
                    select: 'firstName lastName',
                },
               })
            .skip(skip)
            .limit(Number(limit))
            .lean();

        res.status(200).json({
            status: 'success',
            data: {
                trips,
                pagination: { totalTrips, totalPages: Math.ceil(totalTrips / limit), currentPage: Number(page), itemsPerPage: Number(limit) },
            },
        });
    } catch (err) {
        console.error('Error fetching trips:', err);
        handleError(res, 500, 'Internal server error');
    }
};

export const getDriverTrips = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        }

        const driverId = req.user._id; // Ensure this is valid
        console.log('Driver ID:', driverId); // Debugging

        const trips = await Trip.find({ assignedDriver: driverId });

        if (!trips.length) {
            return res.status(404).json({ status: 'error', message: 'No trips found' });
        }

        res.status(200).json({
            status: 'success',
            data: trips,
        });
    } catch (error) {
        console.error('Error fetching driver trips:', error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};


// Get a specific trip by ID (Manager and Driver)
export const getTripById = async (req, res) => {
    try {
        const { tripId } = req.params;
        const trip = await Trip.findById(tripId).populate('vehicle', 'registrationNumber').populate('driver', 'firstName lastName').lean();

        if (!trip) return handleError(res, 404, 'Trip not found');

        res.status(200).json({ status: 'success', data: { trip } });
    } catch (err) {
        console.error('Error fetching trip:', err);
        handleError(res, 500, 'Internal server error');
    }
};

// Update a trip record (Manager and Driver)
export const updateTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const errors = validationResult(req);
        if (!errors.isEmpty()) return handleError(res, 400, errors.array().map(err => err.msg).join('. '));

        const updatedTrip = await Trip.findByIdAndUpdate(tripId, { $set: req.body }, { new: true, runValidators: true })
            .populate('vehicle', 'registrationNumber') 
            .populate('driver', 'firstName lastName');

        if (!updatedTrip) return handleError(res, 404, 'Trip not found');

        res.status(200).json({ status: 'success', data: { trip: updatedTrip } });
    } catch (err) {
        console.error('Error updating trip:', err);
        handleError(res, 500, 'Internal server error');
    }
};

// Delete a trip record (Manager-only)
export const deleteTrip = async (req, res) => {
    try {
        const { tripId } = req.params;

        const trip = await Trip.findById(tripId);
        if (!trip) return handleError(res, 404, 'Trip not found');
        if (trip.tripStatus === 'Completed') return handleError(res, 403, 'Completed trips cannot be deleted');

        await Trip.findByIdAndDelete(tripId);
        res.status(200).json({ status: 'success', message: 'Trip deleted successfully' });
    } catch (err) {
        console.error('Error deleting trip:', err);
        handleError(res, 500, 'Internal server error');
    }
};
