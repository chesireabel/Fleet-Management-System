import mongoose, { Schema, model } from 'mongoose';

const tripSchema = new Schema({
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { 
        type: Date, 
        validate: {
            validator: function(value) {
                return !value || value > this.startTime;
            },
            message: "End time must be after start time."
        }
    },
    distanceTraveled: { type: Number, required: true, min: 0 }, 
    fuelConsumption: { 
        type: Number, 
        min: 0, 
        default: 0, 
        validate: {
            validator: function(value) {
                return !(this.distanceTraveled === 0 && value > 0);
            },
            message: "Fuel consumption cannot be positive if distance traveled is zero."
        }
    },
    tripStatus: { 
        type: String, 
        enum: ['Completed', 'In Progress', 'Cancelled'],
        default: 'In Progress' 
    },
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for optimized queries
tripSchema.index({ vehicle: 1 });
tripSchema.index({ driver: 1 });
tripSchema.index({ startTime: 1 });

// Virtual for trip duration
tripSchema.virtual('duration').get(function() {
    return this.startTime && this.endTime ? this.endTime - this.startTime : null;
});

// Pre-save hooks for validation
tripSchema.pre('save', function(next) {
    if (this.endTime && this.endTime <= this.startTime) {
        return next(new Error('End time must be after start time.'));
    }
    next();
});

tripSchema.pre('save', async function(next) {
    const Vehicle = mongoose.model('Vehicle');
    const Driver = mongoose.model('Driver');

    if (!mongoose.Types.ObjectId.isValid(this.vehicle)) {
        return next(new Error('Invalid vehicle ID format.'));
    }
    if (!mongoose.Types.ObjectId.isValid(this.driver)) {
        return next(new Error('Invalid driver ID format.'));
    }

    const [vehicleExists, driverExists] = await Promise.all([
        Vehicle.exists({ _id: this.vehicle }),
        Driver.exists({ _id: this.driver })
    ]);

    if (!vehicleExists) return next(new Error('Vehicle ID not found.'));
    if (!driverExists) return next(new Error('Driver ID not found.'));
    
    next();
});

const Trip = model('Trip', tripSchema);
export default Trip;
