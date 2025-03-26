import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
    registrationNumber: { type: String, required: true, unique: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    vehicleType: { type: String, required: true },
    fuelType: { type: String, required: true },
    odometerReading: { type: Number, required: true, default: 0 },
    insuranceDetails: {
        policyNumber: { type: String, required: true },
        insuranceProvider: { type: String, required: true },
        expiryDate: { type: Date, required: true }
    },
    activeStatus: { type: Boolean, default: true },
    lastServiceDate: { type: Date },
    nextServiceDate: { type: Date },
    vehicleHealth: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor'], default: 'Good' },
    createdAt: { type: Date, default: Date.now },
    });


const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;