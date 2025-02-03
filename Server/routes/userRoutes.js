import express from 'express';
import {
  registerUser,
  checkEmailAvailability
} from '../controllers/userController.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.get('/check-email/:email', checkEmailAvailability);

export default router;