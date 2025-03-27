import mongoose, { Schema, model } from 'mongoose';

const tripSchema = new Schema({
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User",required: true  },
  startLocation: { type: String, required: true },
  endLocation: { type: String, required: true },
  scheduledDate: { type: Date, required: true, validate: {
    validator: function (value) {
      return value >= new Date(); // Prevent past dates
    },
    message: 'Scheduled date must be in the future.',
  }},

  // Filled by driver
  startTime: { type: Date },
  endTime: {
    type: Date,
    validate: {
      validator: function (value) {
        return !value || value > this.startTime;
      },
      message: 'End time must be after start time.',
    },
  },
  distanceTraveled: { type: Number, min: 0, default: 0 },
  fuelConsumption: {
    type: Number,
    min: 0,
    default: 0,
    validate: {
      validator: function (value) {
        return !(this.distanceTraveled === 0 && value > 0);
      },
      message: 'Fuel consumption must be zero if no distance was traveled.',
    },
  },
  tripStatus: {
    type: String,
    enum: ['Completed', 'Pending', 'Cancelled'],
    default: 'Pending',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for optimized queries
tripSchema.index({ vehicle: 1 });
tripSchema.index({ user: 1 });
tripSchema.index({ startTime: 1 });
tripSchema.index({ vehicle: 1, user: 1 }); // Compound index

// Virtual for trip duration
tripSchema.virtual('duration').get(function () {
  return this.startTime && this.endTime ? this.endTime - this.startTime : null;
});

// Pre-save hooks for validation
tripSchema.pre('save', function (next) {
  if (this.endTime && this.startTime && this.endTime <= this.startTime) {
    return next(new Error('End time must be after start time.'));
  }
  next();
});

tripSchema.pre('save', async function (next) {
  const Vehicle = mongoose.model('Vehicle');
  const User = mongoose.model('User');

  if (!mongoose.Types.ObjectId.isValid(this.vehicle)) {
    return next(new Error('Invalid vehicle ID format.'));
  }
  if (!mongoose.Types.ObjectId.isValid(this.user)) {
    return next(new Error('Invalid User( driver) ID format.'));
  }

  const [vehicleExists,userExists] = await Promise.all([
    Vehicle.exists({ _id: this.vehicle }),
    User.exists({ _id: this.user }),
  ]);

  if (!vehicleExists) return next(new Error('Vehicle ID not found.'));
  if (!userExists) return next(new Error('User ID not found.'));

  next();
});

const Trip = model('Trip', tripSchema);
export default Trip;
