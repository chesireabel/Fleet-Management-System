import jwt from 'jsonwebtoken';

// Authenticate Middleware
export const authenticate = (req, res, next) => {
  console.log('Request Headers:', req.headers);  
    const token = req.header('Authorization')?.replace('Bearer ', '');

    console.log(`Received Token: ${token}`);
  
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(`Decoded User:`, decoded);
      req.user = decoded; // Attach the user object to the request
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(400).json({ message: 'Invalid token.' });
    }
  };

// Authorize Middleware
export const authorize = (roles) => (req, res, next) => {
  console.log(`User Role: ${req.user.role}`);
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized. User not authenticated.',
      });
    }
    if (!Array.isArray(roles)) {
      roles = [roles]; // Convert single role to an array
  }

  
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to access this resource.',
      });
    }
  
    next();
  };