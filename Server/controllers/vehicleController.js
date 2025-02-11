import { body, validationResult } from 'express-validator';
import Vehicle from '../models/vehicle.js';

// Input validation rules for vehicle creation and updates
export const validateVehicle = [
    body('registrationNumber').notEmpty().withMessage('Registration number is required'),
    body('make').notEmpty().withMessage('Make is required'),
    body('model').notEmpty().withMessage('Model is required'),
    body('year').isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Invalid year'),
    body('vehicleType').notEmpty().withMessage('Vehicle type is required'),
    body('fuelType').notEmpty().withMessage('Fuel type is required'),
    body('odometerReading').optional().isNumeric().withMessage('Odometer reading must be a number'),
    body('insuranceDetails.policyNumber').notEmpty().withMessage('Insurance policy number is required'),
    body('insuranceDetails.insuranceProvider').notEmpty().withMessage('Insurance provider is required'),
    body('insuranceDetails.expiryDate').notEmpty().isISO8601().withMessage('Invalid insurance expiry date (ISO8601 required)'),
    body('activeStatus').optional().isBoolean().withMessage('Active status must be a boolean'),
    body('lastServiceDate').optional().isISO8601().withMessage('Invalid last service date (ISO8601 required)'),
    body('nextServiceDate').optional().isISO8601().withMessage('Invalid next service date (ISO8601 required)'),
    body('vehicleHealth').optional().isString().isIn(['Excellent', 'Good', 'Fair', 'Poor']).withMessage('Invalid vehicle health status'),
];

// Create a new vehicle record
export const createVehicle = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'fail',
                message: errors.array().map(err => err.msg).join('. '),
            });
        }

        // Create a new vehicle document
        const vehicle = new Vehicle(req.body);
        await vehicle.save();

        // Return the created vehicle
        res.status(201).json({
            status: 'success',
            data: {
                vehicle,
            },
        });
    } catch (err) {
        console.error('Error creating vehicle:', err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};

// Get all vehicles with pagination
export const getAllVehicles = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        // Fetch vehicles with pagination
        const vehicles = await Vehicle.find()
            .skip((page - 1) * limit)
            .limit(Number(limit));

        // Return the list of vehicles
        res.status(200).json({
            status: 'success',
            data: {
                vehicles,
            },
        });
    } catch (err) {
        console.error('Error fetching vehicles:', err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};

// Get a specific vehicle by ID
export const getVehicleById = async (req, res) => {
    try {
        const { vehicleId } = req.params;

        // Find the vehicle by ID
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                status: 'fail',
                message: 'Vehicle not found',
            });
        }

        // Return the vehicle
        res.status(200).json({
            status: 'success',
            data: {
                vehicle,
            },
        });
    } catch (err) {
        console.error('Error fetching vehicle:', err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};

// Update a vehicle record (partial updates allowed)
export const updateVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.params;

        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'fail',
                message: errors.array().map(err => err.msg).join('. '),
            });
        }

        // Find and update the vehicle document
        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            vehicleId,
            { $set: req.body }, // Use $set for partial updates
            { new: true } // Return the updated document
        );

        if (!updatedVehicle) {
            return res.status(404).json({
                status: 'fail',
                message: 'Vehicle not found',
            });
        }

        // Return the updated vehicle
        res.status(200).json({
            status: 'success',
            data: {
                vehicle: updatedVehicle,
            },
        });
    } catch (err) {
        console.error('Error updating vehicle:', err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};

// Delete a vehicle record
export const deleteVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.params;

        // Find and delete the vehicle document
        const deletedVehicle = await Vehicle.findByIdAndDelete(vehicleId);

        if (!deletedVehicle) {
            return res.status(404).json({
                status: 'fail',
                message: 'Vehicle not found',
            });
        }

        // Return success message
        res.status(200).json({
            status: 'success',
            message: 'Vehicle deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting vehicle:', err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};