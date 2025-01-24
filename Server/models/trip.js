import { Schema, model } from 'mongoose';

const tripSchema = new Schema({
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    distanceTraveled: { type: Number, required: true }, // in km or miles
    fuelConsumption: { type: Number }, // in liters or gallons
    tripStatus: { type: String, enum: ['Completed', 'In Progress', 'Cancelled'], default: 'In Progress' },
    gpsCoordinates: [{
        latitude: { type: Number },
        longitude: { type: Number },
        timestamp: { type: Date }
    }],
    createdAt: { type: Date, default: Date.now },
});

const Trip = model('Trip', tripSchema);

export default Trip;
