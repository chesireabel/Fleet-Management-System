import { body, validationResult } from 'express-validator';
import Trip from '../models/trip.js';

// Reusable error handler
const handleError = (res, statusCode, message) => {
    res.status(statusCode).json({
        status: statusCode >= 500 ? 'error' : 'fail',
        message,
    });
};

// Input validation rules for trip creation and updates
export const validateTrip = [
    body('vehicle')
        .notEmpty().withMessage('Vehicle ID is required')
        .isMongoId().withMessage('Invalid vehicle ID'),
    body('driver')
        .notEmpty().withMessage('Driver ID is required')
        .isMongoId().withMessage('Invalid driver ID'),
    body('startLocation')
        .notEmpty().withMessage('Start location is required'),
    body('endLocation')
        .notEmpty().withMessage('End location is required'),
    body('startTime')
        .notEmpty().withMessage('Start time is required')
        .isISO8601().withMessage('Invalid start time (ISO8601 required)'),
    body('endTime')
        .optional()
        .isISO8601().withMessage('Invalid end time (ISO8601 required)')
        .custom((value, { req }) => {
            if (value && new Date(value) <= new Date(req.body.startTime)) {
                throw new Error('End time must be after start time');
            }
            return true;
        }),
    body('distanceTraveled')
        .notEmpty().withMessage('Distance traveled is required')
        .isNumeric().withMessage('Distance traveled must be a number')
        .custom((value) => {
            if (value < 0) {
                throw new Error('Distance traveled must be a non-negative number');
            }
            return true;
        }),
    body('fuelConsumption')
        .optional()
        .isNumeric().withMessage('Fuel consumption must be a number')
        .custom((value) => {
            if (value < 0) {
                throw new Error('Fuel consumption must be a non-negative number');
            }
            return true;
        }),
    body('tripStatus')
        .optional()
        .isString().withMessage('Trip status must be a string')
        .isIn(['Completed', 'In Progress', 'Cancelled']).withMessage('Invalid trip status'),
];

// Create a new trip record
export const createTrip = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return handleError(res, 400, errors.array().map(err => err.msg).join('. '));
        }

        // Create a new trip document
        const trip = new Trip(req.body);
        await trip.save();

        // Return the created trip
        res.status(201).json({
            status: 'success',
            data: { trip },
        });
    } catch (err) {
        console.error('Error creating trip:', err);
        handleError(res, 500, 'Internal server error');
    }
};

// Get all trips with pagination
export const getAllTrips = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // Fetch trips with pagination
        const totalTrips = await Trip.countDocuments();
        const trips = await Trip.find()
            .populate('vehicle')
            .populate('driver')
            .skip(skip)
            .limit(Number(limit));

        // Return the list of trips with pagination metadata
        res.status(200).json({
            status: 'success',
            data: {
                trips,
                pagination: {
                    totalTrips,
                    totalPages: Math.ceil(totalTrips / limit),
                    currentPage: Number(page),
                    itemsPerPage: Number(limit),
                },
            },
        });
    } catch (err) {
        console.error('Error fetching trips:', err);
        handleError(res, 500, 'Internal server error');
    }
};

// Get a specific trip by ID
export const getTripById = async (req, res) => {
    try {
        const { tripId } = req.params;

        // Find the trip by ID
        const trip = await Trip.findById(tripId)
            .populate('vehicle')
            .populate('driver');

        if (!trip) {
            return handleError(res, 404, 'Trip not found');
        }

        // Return the trip
        res.status(200).json({
            status: 'success',
            data: { trip },
        });
    } catch (err) {
        console.error('Error fetching trip:', err);
        handleError(res, 500, 'Internal server error');
    }
};

// Update a trip record (partial updates allowed)
export const updateTrip = async (req, res) => {
    try {
        const { tripId } = req.params;

        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return handleError(res, 400, errors.array().map(err => err.msg).join('. '));
        }

        // Find and update the trip document
        const updatedTrip = await Trip.findByIdAndUpdate(
            tripId,
            { $set: req.body }, // Use $set for partial updates
            { new: true, runValidators: true } // Return the updated document and run validators
        )
            .populate('vehicle')
            .populate('driver');

        if (!updatedTrip) {
            return handleError(res, 404, 'Trip not found');
        }

        // Return the updated trip
        res.status(200).json({
            status: 'success',
            data: { trip: updatedTrip },
        });
    } catch (err) {
        console.error('Error updating trip:', err);
        handleError(res, 500, 'Internal server error');
    }
};

// Delete a trip record
export const deleteTrip = async (req, res) => {
    try {
        const { tripId } = req.params;

        // Find and delete the trip document
        const deletedTrip = await Trip.findByIdAndDelete(tripId);

        if (!deletedTrip) {
            return handleError(res, 404, 'Trip not found');
        }

        // Return success message
        res.status(200).json({
            status: 'success',
            message: 'Trip deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting trip:', err);
        handleError(res, 500, 'Internal server error');
    }
};