import jwt from 'jsonwebtoken';
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,  // Unique user ID
            role: user.role    // Include user role in token
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // Token valid for 7 days
    );
};

export default generateToken;
