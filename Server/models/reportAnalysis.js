import { Schema, model } from 'mongoose';

const reportAnalysisSchema = new Schema({
    reportType: { type: String, enum: ['Trip Summary', 'Maintenance Report', 'Fuel Efficiency'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalTrips: { type: Number },
    totalDistance: { type: Number }, // Total distance traveled in the report period
    totalFuelConsumed: { type: Number },
    totalMaintenanceCost: { type: Number },
    vehicleReports: [{
        vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
        totalTrips: { type: Number },
        totalDistance: { type: Number },
        averageSpeed: { type: Number },
        fuelEfficiency: { type: Number },
        maintenanceCost: { type: Number }
    }],
    createdAt: { type: Date, default: Date.now },
});

const ReportAnalysis = model('ReportAnalysis', reportAnalysisSchema);

export default ReportAnalysis;
