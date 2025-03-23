import jwt from 'jsonwebtoken';

// Authenticate Middleware
export const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach the user object to the request
      next();
    } catch (error) {
      return res.status(400).json({ message: 'Invalid token.' });
    }
  };

// Authorize Middleware
export const authorize = (roles) => (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized. User not authenticated.',
      });
    }
  
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to access this resource.',
      });
    }
  
    next();
  };