import express from 'express';
import {
  registerUser,
  checkEmailAvailability
} from '../controllers/userController.js';

const router = express.Router();

// Public routes
// Add this to userRoutes.js to test basic route handling
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the users route' });
  });
  
router.post('/register', registerUser);
router.get('/check-email/:email', checkEmailAvailability);

export default router;