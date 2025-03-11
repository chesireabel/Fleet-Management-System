import { Schema, model } from 'mongoose';

const reportAnalysisSchema = new Schema({
    reportType: {
        type: String,
        enum: ['Trip Summary', 'Maintenance History', 'Driver Performance', 'Fuel Consumption', 'Incident Report'],
        required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    // Trip Summary Report Fields
    totalTrips: { type: Number, default: 0 },
    totalDistance: { type: Number, default: 0 },
    totalFuelConsumed: { type: Number, default: 0 },
    mostFrequentRoutes: [{ type: String }],

    // Maintenance History Report Fields
    maintenanceRecords: [{
        vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
        serviceType: { type: String },
        serviceDate: { type: Date },
        nextServiceDate: { type: Date },
        serviceCenter: { type: String },
        cost: { type: Number },
        notes: { type: String }
    }],

    // Driver Performance Report Fields
    driverPerformance: [{
        driver: { type: Schema.Types.ObjectId, ref: 'Driver' },
        totalTrips: { type: Number, default: 0 },
        totalDistance: { type: Number, default: 0 },
        averageSpeed: { type: Number, default: 0 },
        fuelEfficiency: { type: Number, default: 0 },
        safetyScore: { type: Number, default: 0 }
    }],

    // Fuel Consumption Report Fields
    fuelConsumption: [{
        vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
        totalFuelUsed: { type: Number, default: 0 },
        totalDistance: { type: Number, default: 0 },
        fuelEfficiency: { type: Number, default: 0 } // km per liter
    }],

    // Incident Report Fields
    incidents: [{
        vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
        driver: { type: Schema.Types.ObjectId, ref: 'Driver' },
        incidentType: { type: String, enum: ['Accident', 'Breakdown', 'Traffic Violation', 'Other'] },
        location: { type: String },
        timestamp: { type: Date, default: Date.now },
        notes: { type: String }
    }],

    // Metadata
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    purpose: { type: String, trim: true },
    reportFile: {
        url: { type: String, trim: true },
        format: { type: String, enum: ['PDF', 'CSV', 'Excel'] }
    },
    filters: {
        vehicleIds: [{ type: Schema.Types.ObjectId, ref: 'Vehicle' }],
        driverIds: [{ type: Schema.Types.ObjectId, ref: 'Driver' }],
        includeInactive: { type: Boolean, default: false }
    },

    // Status and Timestamp
    reportStatus: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

// Indexes
reportAnalysisSchema.index({ reportType: 1, startDate: 1, endDate: 1, reportStatus: 1 });
reportAnalysisSchema.index({ purpose: 'text', 'incidents.notes': 'text' });

// Virtuals
reportAnalysisSchema.virtual('durationInDays').get(function () {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

// Methods
reportAnalysisSchema.methods.generateSummary = function () {
    return {
        reportType: this.reportType,
        startDate: this.startDate,
        endDate: this.endDate,
        totalRecords: this.maintenanceRecords.length + this.incidents.length,
        status: this.reportStatus
    };
};

// Validation
reportAnalysisSchema.pre('validate', function (next) {
    const maxDateRange = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
    if (this.startDate > this.endDate) {
        return next(new Error('End date must be greater than or equal to start date'));
    }
    if ((this.endDate - this.startDate) > maxDateRange) {
        return next(new Error('Date range cannot exceed 1 year'));
    }
    if (this.reportType === 'Trip Summary' && !this.totalTrips) {
        return next(new Error('Total trips is required for Trip Summary reports'));
    }
    if (this.reportType === 'Maintenance History' && this.maintenanceRecords.length === 0) {
        return next(new Error('At least one maintenance record is required for Maintenance History reports'));
    }
    next();
});

const ReportAnalysis = model('ReportAnalysis', reportAnalysisSchema);
export default ReportAnalysis;