import { body, validationResult } from 'express-validator';
import Driver from '../models/driver.js';

// Validation middleware for driver data
export const validateDriver = [
  body('firstName').notEmpty().withMessage('First name is required').trim().isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
  body('lastName').notEmpty().withMessage('Last name is required').trim().isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
  body('phone').notEmpty().withMessage('Phone number is required').matches(/^\+?(\d[\d-. ]+)?(\([\d-. ]+\))?[\d-. ]+\d$/).withMessage('Invalid phone number format'),
  body('licenseNumber').notEmpty().withMessage('License number is required').isLength({ min: 8, max: 20 }).withMessage('License number must be between 8 and 20 characters'),
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  body('dateOfBirth').notEmpty().withMessage('Date of birth is required').isISO8601().withMessage('Invalid date format. Use YYYY-MM-DD or ISO 8601 format.'),
  body('hireDate').notEmpty().withMessage('Hire date is required').isISO8601().withMessage('Invalid date format. Use YYYY-MM-DD or ISO 8601 format.'),// Ensure the date is in ISO 8601 format.withMessage('Invalid date format. Use YYYY-MM-DD or ISO 8601 format.'),  
  body('drivingScore').optional().isInt({ min: 0, max: 100 }).withMessage('Driving score must be between 0 and 100'),
  body('activeStatus').optional().isBoolean().withMessage('Active status must be a boolean'),
  
];

// Create a new driver
export const createDriver = async (req, res) => {
    console.log('Request Body:', req.body);
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation Errors:', errors.array()); // Log validation errors
        return res.status(400).json({ status: 'fail', message: 'Validation failed', errors: errors.array() });
      }
  

    // Extract fields from request body
    const { firstName, lastName, licenseNumber, phone, email, dateOfBirth, drivingScore, activeStatus, hireDate } = req.body;

    // Handle file upload
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : '';

    // Create new driver
    const driver = new Driver({
      firstName,
      lastName,
      phone,
      licenseNumber,
      email,
      dateOfBirth: new Date(dateOfBirth), // Convert to Date object
      drivingScore,
      activeStatus,
      hireDate: new Date(hireDate), // Convert to Date object
      profilePicture,
    });

    // Save driver to database
    await driver.save();

    // Return success response
    res.status(201).json({
      status: 'success',
      data: { driver },
    });
  } catch (err) {
    console.error('Error creating driver:', err);
    if (err.name === 'ValidationError') {
    console.log('Mongoose Validation Errors:', err.errors); 
      return res.status(400).json({ status: 'fail', message: 'Validation failed', errors: err.errors });
    }
    res.status(500).json({ status: 'error', message: 'Internal server error', error: err.message });
  }
};

// Get all drivers
export const getAllDrivers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const drivers = await Driver.find()
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      status: 'success',
      data: { drivers },
    });
  } catch (err) {
    console.error('Error fetching drivers:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error', error: err.message });
  }
};

export const getAllDriversWithoutPagination = async (req, res) => {
    try {
      console.log('Fetching all drivers without pagination'); // Debugging
      const drivers = await Driver.find(); // Fetch all drivers from the database
  
      res.status(200).json({
        status: 'success',
        data: { drivers },
      });
    } catch (err) {
      console.error('Error fetching drivers:', err);
      res.status(500).json({ status: 'error', message: 'Internal server error', error: err.message });
    }
  };
// Get a specific driver by ID
export const getDriverById = async (req, res) => {
  try {
    const { driverId } = req.params;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        status: 'fail',
        message: 'Driver not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { driver },
    });
  } catch (err) {
    console.error('Error fetching driver:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error', error: err.message });
  }
};

// Update a driver
export const updateDriver = async (req, res) => {
  try {
    const { driverId } = req.params;

    // Extract fields from request body
    const { firstName, lastName, licenseNumber, phone, email, dateOfBirth, drivingScore, activeStatus, hireDate } = req.body;

    // Handle file upload
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : req.body.profilePicture;

    // Update driver
    const updatedDriver = await Driver.findByIdAndUpdate(
      driverId,
      {
        firstName,
        lastName,
        phone,
        licenseNumber,
        email,
        dateOfBirth: new Date(dateOfBirth), // Convert to Date object
        drivingScore,
        activeStatus,
        hireDate: new Date(hireDate), // Convert to Date object
        profilePicture,
      },
      { new: true, runValidators: true } // Return updated document and run validators
    );

    if (!updatedDriver) {
      return res.status(404).json({
        status: 'fail',
        message: 'Driver not found',
      });
    }

    // Return success response
    res.status(200).json({
      status: 'success',
      data: { driver: updatedDriver },
    });
  } catch (err) {
    console.error('Error updating driver:', err);
    if (err.name === 'ValidationError') {
        console.log('Mongoose Validation Errors:', err.errors); 
      return res.status(400).json({ status: 'fail', message: 'Validation failed', errors: err.errors });
    }
    res.status(500).json({ status: 'error', message: 'Internal server error', error: err.message });
  }
};

// Delete a driver
export const deleteDriver = async (req, res) => {
  try {
    const { driverId } = req.params;

    const deletedDriver = await Driver.findByIdAndDelete(driverId);

    if (!deletedDriver) {
      return res.status(404).json({
        status: 'fail',
        message: 'Driver not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Driver deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting driver:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error', error: err.message });
  }
};