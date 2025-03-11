import { body, param, validationResult } from 'express-validator';
import MaintenanceRecord from '../models/maintainence.js';

// Utility function to handle errors
const handleError = (res, error, statusCode = 400) => {
    logger.error(error.message); // Log the error
    res.status(statusCode).json({ success: false, error: error.message });
};

// Validation middleware for maintenance records
export const validateMaintenance = [
    body('vehicle').notEmpty().withMessage('Vehicle ID is required').isMongoId().withMessage('Invalid Vehicle ID'),
    body('serviceType').notEmpty().withMessage('Service type is required'),
    body('serviceDate').isISO8601().withMessage('Invalid service date'),
    body('nextServiceDate').optional().isISO8601().withMessage('Invalid next service date'),
    body('serviceCenter').optional().isString().withMessage('Service center must be a string'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
    body('cost').optional().isNumeric().withMessage('Cost must be a number'),
];

// Validation middleware for IDs
export const validateId = [
    param('vehicleId').optional().isMongoId().withMessage('Invalid Vehicle ID'),
    param('maintenanceId').optional().isMongoId().withMessage('Invalid Maintenance ID'),
];

// Create a maintenance record
export const createMaintenance = async (req, res) => {
    try {
        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { vehicle, serviceType, serviceDate, nextServiceDate, serviceCenter, notes, cost } = req.body;

        const maintenance = new MaintenanceRecord({
            vehicle,
            serviceType,
            serviceDate,
            nextServiceDate,
            serviceCenter,
            notes,
            cost,
        });

        await maintenance.save();
        logger.info(`Maintenance record created for vehicle: ${vehicle}`);
        res.status(201).json({ success: true, data: maintenance });
    } catch (err) {
        handleError(res, err);
    }
};

// Get all maintenance records with pagination
export const getAllMaintenances = async (req, res) => {
    try {
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const maintenances = await MaintenanceRecord.find()
            .populate('vehicle')
            .skip(skip)
            .limit(limit);

        const totalRecords = await MaintenanceRecord.countDocuments();

        res.status(200).json({
            success: true,
            data: maintenances,
            pagination: {
                page,
                limit,
                totalRecords,
                totalPages: Math.ceil(totalRecords / limit),
            },
        });
    } catch (err) {
        handleError(res, err);
    }
};

// Get maintenance records by vehicle ID
export const getMaintenanceByVehicle = async (req, res) => {
    try {
        // Validate request parameters
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { vehicleId } = req.params;

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const maintenances = await MaintenanceRecord.find({ vehicle: vehicleId })
            .populate('vehicle')
            .skip(skip)
            .limit(limit);

        const totalRecords = await MaintenanceRecord.countDocuments({ vehicle: vehicleId });

        if (!maintenances || maintenances.length === 0) {
            return res.status(404).json({ success: false, message: 'No maintenance records found for this vehicle' });
        }

        res.status(200).json({
            success: true,
            data: maintenances,
            pagination: {
                page,
                limit,
                totalRecords,
                totalPages: Math.ceil(totalRecords / limit),
            },
        });
    } catch (err) {
        handleError(res, err);
    }
};

// Update a maintenance record
export const updateMaintenance = async (req, res) => {
    try {
        // Validate request body and parameters
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { maintenanceId } = req.params;
        const { serviceType, serviceDate, nextServiceDate, serviceCenter, notes, cost } = req.body;

        const updatedMaintenance = await MaintenanceRecord.findByIdAndUpdate(
            maintenanceId,
            { serviceType, serviceDate, nextServiceDate, serviceCenter, notes, cost },
            { new: true }
        );

        if (!updatedMaintenance) {
            return res.status(404).json({ success: false, message: 'Maintenance record not found' });
        }

        logger.info(`Maintenance record updated: ${maintenanceId}`);
        res.status(200).json({ success: true, data: updatedMaintenance });
    } catch (err) {
        handleError(res, err);
    }
};

// Delete a maintenance record
export const deleteMaintenance = async (req, res) => {
    try {
        // Validate request parameters
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { maintenanceId } = req.params;

        const deletedMaintenance = await MaintenanceRecord.findByIdAndDelete(maintenanceId);

        if (!deletedMaintenance) {
            return res.status(404).json({ success: false, message: 'Maintenance record not found' });
        }

        logger.info(`Maintenance record deleted: ${maintenanceId}`);
        res.status(200).json({ success: true, message: 'Maintenance record deleted successfully' });
    } catch (err) {
        handleError(res, err);
    }
};