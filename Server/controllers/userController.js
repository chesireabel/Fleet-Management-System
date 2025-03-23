import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

// Input validation rules for user registration
export const validateUserRegistration = [
    body('name').notEmpty().withMessage('Name is required'),
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

        const { name, email, password, role } = req.body;

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
            name,
            email,
            password,
            role,
        });

        console.log('New User:', newUser);

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
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

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decodedToken);

        // Remove sensitive data from response
        user.password = undefined;

        res.status(200).json({
            status: 'success',
            token,
            role: user.role, // Include the role in the response
            data: {
                user,
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