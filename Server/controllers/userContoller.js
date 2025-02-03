import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Handle user registration
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        status: 'fail',
        message: 'All fields are required'
      });
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      role
    });

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
      data: {
        user: newUser
      }
    });

  } catch (error) {
    handleRegistrationErrors(error, res);
  }
};

// Check email availability
export const checkEmailAvailability = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    res.status(200).json({
      available: !user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error checking email availability'
    });
  }
};

// Error handling utility
const handleRegistrationErrors = (error, res) => {
  // Handle duplicate email error
  if (error.code === 11000) {
    return res.status(400).json({
      status: 'fail',
      message: 'Email already exists in our system'
    });
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      status: 'fail',
      message: messages.join('. ')
    });
  }

  // Handle custom errors from pre-save hooks
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      status: 'fail',
      message: error.message
    });
  }

  // Generic error handler
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong! Please try again later'
  });
};