import { body, validationResult } from 'express-validator';
import Trip from '../models/trip.js';
import Driver from '../models/driver.js';
import Vehicle from '../models/vehicle.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Reusable error handler
const handleError = (res, statusCode, message) => {
    res.status(statusCode).json({
        status: statusCode >= 500 ? 'error' : 'fail',
        message,
    });
};

// Middleware to validate trip data (for creating a trip)
export const validateTrip = [
    body('user').notEmpty().withMessage('Driver (user) ID is required').isMongoId().withMessage('Invalid user ID'),  
      body('vehicle').notEmpty().withMessage('Vehicle ID is required').isMongoId().withMessage('Invalid vehicle ID'),    body('startLocation').notEmpty().withMessage('Start location is required'),
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
        console.log('Received trip creation request:', req.body);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error('Validation errors:', errors.array());
            return res.status(400).json({ status: 'fail', message: errors.array().map(err => err.msg).join('. ') });
        }

        const { user, vehicle, startLocation, endLocation, scheduledDate } = req.body;

        if (new Date(scheduledDate) <= new Date()) {
            console.error('Scheduled date must be in the future');
            return res.status(400).json({ status: 'fail', message: 'Scheduled date must be in the future' });
        }
          
        console.log('Validating user and vehicle IDs...');
        if (!mongoose.Types.ObjectId.isValid(user) || !mongoose.Types.ObjectId.isValid(vehicle)) {
            console.error('Invalid ID format');
            return res.status(400).json({ status: 'fail', message: 'Invalid ID format' });
        }

           
        const userId = new mongoose.Types.ObjectId(user);
        const vehicleId = new mongoose.Types.ObjectId(vehicle);


        console.log('Checking if user is a driver...');
        const driver = await User.findOne({ _id: user, role: 'driver' });
        console.log('Received User ID:', user);
        if (!driver) {
            console.error('Driver not found');
            return res.status(404).json({ status: 'fail', message: 'Driver not found' });
        }
        
        console.log('Checking if vehicle exists...');
        const vehicleDoc = await Vehicle.findById(vehicle);
        if (!vehicleDoc) {
            console.error('Vehicle not found');
            return res.status(404).json({ status: 'fail', message: 'Vehicle not found' });
        }

        console.log('Checking for active trips...');
        const activeTrip = await Trip.findOne({ 
            $or: [{ user }, { vehicle }], 
            tripStatus: { $ne: 'Completed' }
        });
        if (activeTrip) {
            console.error('Driver or vehicle is already on an active trip');
            return res.status(400).json({ status: 'fail', message: 'Driver or vehicle is already on an active trip' });
        }

        console.log('Creating new trip...');
        const trip = new Trip({
            user: userId, 
            vehicle: vehicleId,
                           startLocation, endLocation, scheduledDate });
        await trip.save();

        console.log('Received trip creation request:', req.body);


        console.log('Trip successfully created:', trip);
        res.status(201).json({ status: 'success', data: { trip } });
    } catch (err) {
        console.error('Error creating trip:', err);
        return res.status(500).json({ status: 'error', message: 'Internal server error' });
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

        // Get driver information from User collection
        const driver = await User.findById(trip.user);
        if (!driver) return handleError(res, 404, 'Driver not found');

        if (driver.role !== 'driver') {
            return handleError(res, 403, 'User is not a driver');
        }


        if (!driver.performanceMetrics) {
            driver.performanceMetrics = {
                totalTrips: 0,
                totalDistance: 0,
                totalFuelConsumed: 0,
                averageSpeed: 0,
            };
        }

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
        .populate({
            path: 'vehicle',
            select: 'registrationNumber',
        })
        .populate('user', 'firstName lastName email') 
        .skip(skip)
        .limit(Number(limit))
        .lean();
    
    const sanitizedTrips = trips.map(trip => ({
        ...trip,
        driver: trip.driver ? {
            ...trip.driver,
            user: trip.driver.user ? trip.driver.user : { firstName: 'Unknown', lastName: 'User' }
        } : { user: { firstName: 'No', lastName: 'Driver' } }
    }));
    
    res.status(200).json({
        status: 'success',
        data: {
            trips: sanitizedTrips,
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
        const driverId = req.user.id;

        // Ensure user exists and is a driver
        const driver = await User.findById(driverId);
        if (!driver || driver.role !== 'driver') return handleError(res, 403, 'Access denied');

        // Get trips for this user
        const trips = await Trip.find({ user: driverId })
            .populate('vehicle', 'registrationNumber')
            .populate('user', 'firstName lastName')
            .lean();

        res.status(200).json({
            status: 'success',
            data: { trips: trips || [] },
        });
    } catch (err) {
        console.error('Error fetching driver trips:', err);
        handleError(res, 500, 'Internal server error');
    }
};



// Get a specific trip by ID (Manager and Driver)
export const getTripById = async (req, res) => {
    try {
        const { tripId } = req.params;
        const trip = await Trip.findById(tripId)
            .populate('vehicle', 'registrationNumber')
            .populate('user', 'firstName lastName')
            .lean();

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
            .populate('user', 'firstName lastName');

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
