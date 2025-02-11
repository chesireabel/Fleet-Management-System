import { Schema, model } from 'mongoose';

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
    distanceTraveled: { type: Number, required: true, min: 0 }, // Prevent negative values
    fuelConsumption: { type: Number, min: 0, default: 0 }, // Optional but must be non-negative
    tripStatus: { 
        type: String, 
        enum: {
            values: ['Completed', 'In Progress', 'Cancelled'],
            message: 'Trip status must be either "Completed", "In Progress", or "Cancelled".'
        },
        default: 'In Progress' 
    },
}, { 
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
});

// Indexes for frequently queried fields
tripSchema.index({ vehicle: 1 });
tripSchema.index({ driver: 1 });
tripSchema.index({ startTime: 1 });

// Virtual for trip duration
tripSchema.virtual('duration').get(function() {
    if (this.startTime && this.endTime) {
        return this.endTime - this.startTime; // Duration in milliseconds
    }
    return null;
});

// Pre-save hook to validate endTime
tripSchema.pre('save', function(next) {
    if (this.endTime && this.endTime <= this.startTime) {
        next(new Error('End time must be after start time.'));
    } else {
        next();
    }
});

// Pre-save hook to validate vehicle and driver IDs
tripSchema.pre('save', async function(next) {
    const Vehicle = model('Vehicle');
    const Driver = model('Driver');

    const vehicleExists = await Vehicle.exists({ _id: this.vehicle });
    const driverExists = await Driver.exists({ _id: this.driver });

    if (!vehicleExists) {
        next(new Error('Invalid vehicle ID.'));
    } else if (!driverExists) {
        next(new Error('Invalid driver ID.'));
    } else {
        next();
    }
});

const Trip = model('Trip', tripSchema);

export default Trip;