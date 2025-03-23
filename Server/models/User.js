import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['fleet_manager', 'driver', 'maintenance_team', 'finance_team', 'senior_management'],
    required: [true, 'Role is required'],
  },
  refreshToken: {
    type: String,
    select: false, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to check for existing email before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('email')) {
    const existingUser = await mongoose.model('User').findOne({ email: this.email });
    if (existingUser) {
      const error = new Error('Email already registered');
      error.statusCode = 400;
      return next(error);
    }
  }
  next();
});

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(err);
  }
});

// Middleware to update the `updatedAt` field before saving
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method for password comparison
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Static method to find a user by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email }).select('+password'); // Include password for login
};

const User = mongoose.model('User', userSchema);

export default User;