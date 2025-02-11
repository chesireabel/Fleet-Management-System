import { body, validationResult } from 'express-validator';
import Driver from '../models/driver.js';

// Input validation rules for driver creation and updates
export const validateDriver = [
    body('firstName').notEmpty().withMessage('First name is required').trim().isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
    body('lastName').notEmpty().withMessage('Last name is required').trim().isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
    body('phone').notEmpty().withMessage('Phone number is required').matches(/^\+?(\d[\d-. ]+)?(\([\d-. ]+\))?[\d-. ]+\d$/).withMessage('Invalid phone number format'),
    body('licenseNumber').notEmpty().withMessage('License number is required').isLength({ min: 8, max: 20 }).withMessage('License number must be between 8 and 20 characters'),
    body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
    body('dateOfBirth').notEmpty().withMessage('Date of birth is required').isDate().withMessage('Invalid date format'),
    body('drivingScore').optional().isInt({ min: 0, max: 100 }).withMessage('Driving score must be between 0 and 100'),
    body('activeStatus').optional().isBoolean().withMessage('Active status must be a boolean'),
];

// Create a new driver record
export const createDriver = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'fail',
                message: errors.array().map(err => err.msg).join('. '),
            });
        }

        // Create a new driver document
        const driver = new Driver(req.body);
        await driver.save();

        // Return the created driver
        res.status(201).json({
            status: 'success',
            data: {
                driver,
            },
        });
    } catch (err) {
        console.error('Error creating driver:', err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};

// Get all drivers with pagination
export const getAllDrivers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        // Fetch drivers with pagination
        const drivers = await Driver.find()
            .skip((page - 1) * limit)
            .limit(Number(limit));

        // Return the list of drivers
        res.status(200).json({
            status: 'success',
            data: {
                drivers,
            },
        });
    } catch (err) {
        console.error('Error fetching drivers:', err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};

// Get a specific driver by ID
export const getDriverById = async (req, res) => {
    try {
        const { driverId } = req.params;

        // Find the driver by ID
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({
                status: 'fail',
                message: 'Driver not found',
            });
        }

        // Return the driver
        res.status(200).json({
            status: 'success',
            data: {
                driver,
            },
        });
    } catch (err) {
        console.error('Error fetching driver:', err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};

// Update a driver record (partial updates allowed)
export const updateDriver = async (req, res) => {
    try {
        const { driverId } = req.params;

        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'fail',
                message: errors.array().map(err => err.msg).join('. '),
            });
        }

        // Find and update the driver document
        const updatedDriver = await Driver.findByIdAndUpdate(
            driverId,
            { $set: req.body }, // Use $set for partial updates
            { new: true } // Return the updated document
        );

        if (!updatedDriver) {
            return res.status(404).json({
                status: 'fail',
                message: 'Driver not found',
            });
        }

        // Return the updated driver
        res.status(200).json({
            status: 'success',
            data: {
                driver: updatedDriver,
            },
        });
    } catch (err) {
        console.error('Error updating driver:', err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};

// Delete a driver record
export const deleteDriver = async (req, res) => {
    try {
        const { driverId } = req.params;

        // Find and delete the driver document
        const deletedDriver = await Driver.findByIdAndDelete(driverId);

        if (!deletedDriver) {
            return res.status(404).json({
                status: 'fail',
                message: 'Driver not found',
            });
        }

        // Return success message
        res.status(200).json({
            status: 'success',
            message: 'Driver deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting driver:', err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};