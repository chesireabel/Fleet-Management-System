import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';

// Input validation rules for user registration
export const validateUserRegistration = [
    body('firstName').notEmpty().withMessage('firstName is required'),
    body('lastName').notEmpty().withMessage('lastName is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
    body('role').isIn(['driver', 'fleet_manager', 'finance_team', 'maintenance_team', 'senior_management'])
        .withMessage('Invalid role'),
];

// Input validation rules for user login
export const validateLogin = [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required'),
];

// Handle user registration
export const registerUser = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'fail',
                message: errors.array().map(err => err.msg).join('. '),
            });
        }

        const { firstName,lastName, email, password, role } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'fail',
                message: 'Email already exists in our system',
            });
        }

        // Create new user
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password,
            role,
        });

        console.log('New User:', newUser);

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser._id.toString(), role: newUser.role, unique: uuidv4() },  // 👈 Forces uniqueness
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        // Remove sensitive data from response
        newUser.password = undefined;

        res.status(201).json({
            status: 'success',
            token,
            role: newUser.role, // Include the role in the response
            data: {
                user: newUser,
            },
        });
    } catch (error) {
        handleRegistrationErrors(error, res);
    }
};

// Handle user login
export const loginUser = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'fail',
                message: errors.array().map(err => err.msg).join('. '),
            });
        }

        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid email or password',
            });
        }

        // Compare passwords
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid email or password',
            });
        }


        const payload = {
            id: user._id.toString(),
            role: user.role,
            iat: Math.floor(Date.now() / 1000),  // Issue time (forces uniqueness)
            unique: uuidv4()  // Random unique ID
        };
        
        console.log("JWT Payload before signing:", payload);
        
        // Generate JWT token
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });
        
        console.log(`Generated Token for ${user.email}: ${token}`);
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decodedToken);

        // Remove sensitive data from response
        user.password = undefined;

        res.status(200).json({
            status: 'success',
            token,
            role: user.role, // Include the role in the response
            data: {
                user:{
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong! Please try again later',
        });
    }
};

// Check email availability
export const checkEmailAvailability = async (req, res) => {
    try {
        const { email } = req.params;

        // Validate email input
        if (!email || !email.includes('@')) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid email address',
            });
        }

        // Check if email exists
        const user = await User.findOne({ email });
        res.status(200).json({
            available: !user,
        });
    } catch (error) {
        console.error('Error checking email availability:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error checking email availability',
        });
    }
};

// Error handling utility
const handleRegistrationErrors = (error, res) => {
    // Handle duplicate email error
    if (error.code === 11000) {
        return res.status(400).json({
            status: 'fail',
            message: 'Email already exists in our system',
        });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
            status: 'fail',
            message: messages.join('. '),
        });
    }

    // Handle custom errors from pre-save hooks
    if (error.statusCode) {
        return res.status(error.statusCode).json({
            status: 'fail',
            message: error.message,
        });
    }

    // Generic error handler
    console.error('Registration error:', error);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong! Please try again later',
    });
};

export const getUsers = async (req, res) => {
    try {
        // Get optional role filter from query parameters
        const { role } = req.query;
        const filter = role ? { role } : {};

        // Get all users (or filtered by role)
        const users = await User.find(filter).select('-password -__v');

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};

export const getDriverById = async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (user.role !== "driver") {
        return res.status(403).json({ message: "Access denied: Not a driver" });
      }
  
      res.json(user); // Send driver details
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
