// middleware/errorMiddleware.js

export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode || 500;  // Default to internal server error if not set
    const message = err.message || 'Internal Server Error'; // Default message
  
    // Log the full error stack for development purposes
    if (process.env.NODE_ENV === 'development') {
      console.error(err.stack);
    }
  
    // Send error response to client
    res.status(statusCode).json({
      message: message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Hide stack trace in production
    });
  };
  