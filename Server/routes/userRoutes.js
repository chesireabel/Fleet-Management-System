import express from 'express';
import {
  registerUser,
  loginUser,
  checkEmailAvailability,
  validateUserRegistration,
  validateLogin,
} from '../controllers/userController.js';

const router = express.Router();

// Routes
router.post('/register', validateUserRegistration, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/check-email/:email', checkEmailAvailability);

export default router;