import { Schema, model } from 'mongoose';

const maintenanceRecordSchema = new Schema({
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    serviceType: { type: String, required: true }, // e.g., Oil change, Tire replacement
    serviceDate: { type: Date, required: true },
    nextServiceDate: { type: Date },
    serviceCenter: { type: String },
    notes: { type: String },
    cost: { type: Number },
    createdAt: { type: Date, default: Date.now },
});

const MaintenanceRecord = model('MaintenanceRecord', maintenanceRecordSchema);
export default MaintenanceRecord;