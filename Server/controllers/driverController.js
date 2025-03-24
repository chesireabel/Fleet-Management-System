import { body, validationResult } from 'express-validator';
import Driver from '../models/driver.js';
import User from '../models/User.js'; 


// Validation middleware for driver data
export const validateDriver = [
  body('userId')
  .notEmpty().withMessage('User ID is required')
  .isMongoId().withMessage('Invalid User ID format'),
  body('phone').notEmpty().withMessage('Phone number is required').matches(/^\+?(\d[\d-. ]+)?(\([\d-. ]+\))?[\d-. ]+\d$/).withMessage('Invalid phone number format'),
  body('licenseNumber').notEmpty().withMessage('License number is required').isLength({ min: 8, max: 20 }).withMessage('License number must be between 8 and 20 characters'),
  body('dateOfBirth').notEmpty().withMessage('Date of birth is required').isISO8601().withMessage('Invalid date format. Use YYYY-MM-DD or ISO 8601 format.'),
  body('hireDate').notEmpty().withMessage('Hire date is required').isISO8601().withMessage('Invalid date format. Use YYYY-MM-DD or ISO 8601 format.'),// Ensure the date is in ISO 8601 format.withMessage('Invalid date format. Use YYYY-MM-DD or ISO 8601 format.'),  
  body('drivingScore').optional().isInt({ min: 0, max: 100 }).withMessage('Driving score must be between 0 and 100'),
  body('activeStatus').optional().isBoolean().withMessage('Active status must be a boolean'),
  
];

// Create a new driver (corrected)
export const createDriver = async (req, res) => {
  console.log('Request Body:', req.body);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation Errors:', errors.array());
      return res.status(400).json({ status: 'fail', message: 'Validation failed', errors: errors.array() });
    }

    const { userId,licenseNumber, phone,  dateOfBirth, drivingScore, activeStatus, hireDate } = req.body;

    const user = await User.findOne({ _id:userId , role: 'driver' });
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'Selected user is not a driver or does not exist' });
    }

    const profilePicture = req.file ? `/uploads/${req.file.filename}` : '';

    const driver = new Driver({
      user: userId,        
      phone,
      licenseNumber,
      dateOfBirth: new Date(dateOfBirth),
      drivingScore,
      activeStatus,
      hireDate: new Date(hireDate),
      profilePicture,
    });

    await driver.save();

    const driverWithUser = {
      ...driver.toObject(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    };

    res.status(201).json({
      status: 'success',
      data: { driver: driverWithUser }
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

// Get all drivers (corrected: removed populate)
export const getAllDrivers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const drivers = await Driver.find()
    .populate(
       'user',
      'firstName lastName email' 
    ) 
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
    console.log('Fetching all drivers without pagination'); 
    const drivers = await Driver.find(); 

    res.status(200).json({
      status: 'success',
      data: { drivers },
    });
  } catch (err) {
    console.error('Error fetching drivers:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error', error: err.message });
  }
};
export const getDriverById = async (req, res) => {
  try {
    const { driverId } = req.params;

    const driver = await Driver.findById(driverId).populate({
      path: 'user',
      select: 'firstName lastName email' // Only include these fields
    });
    if (!driver) {
      return res.status(404).json({ status: 'fail', message: 'Driver not found' });
    }

    res.status(200).json({ status: 'success', data: { driver } });
  } catch (err) {
    console.error('Error fetching driver:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error', error: err.message });
  }
};

// Update driver (corrected populate if using user reference)
export const updateDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { licenseNumber, phone, dateOfBirth, drivingScore, activeStatus, hireDate } = req.body;
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : req.body.profilePicture;

    const updatedDriver = await Driver.findByIdAndUpdate(
      driverId,
      {
        phone,
        licenseNumber,
        dateOfBirth: new Date(dateOfBirth),
        drivingScore,
        activeStatus,
        hireDate: new Date(hireDate),
        profilePicture,
      },
      { new: true, runValidators: true }
    ); 

    if (!updatedDriver) {
      return res.status(404).json({ status: 'fail', message: 'Driver not found' });
    }

    res.status(200).json({ status: 'success', data: { driver: updatedDriver } });
  } catch (err) {
    console.error('Error updating driver:', err);
    if (err.name === 'ValidationError') {
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