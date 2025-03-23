import { Schema, model } from 'mongoose';

const reportAnalysisSchema = new Schema({
    reportType: {
        type: String,
        enum: ['Maintenance', 'DriverPerformance', 'VehicleUtilization', 'Incident'],
        required: [true, 'Report type is required'],
        set: value => value.replace(/\s+/g, '')
    },
    dateRange: {
        start: { 
            type: Date, 
            required: [true, 'Start date is required'],
            validate: {
                validator: function(date) {
                    return date <= this.dateRange.end;
                },
                message: 'Start date must be before end date'
            }
        },
        end: { 
            type: Date, 
            required: [true, 'End date is required'],
            validate: {
                validator: function(date) {
                    return date >= this.dateRange.start;
                },
                message: 'End date must be after start date'
            }
        }
    },
    reportData: {
        type: Schema.Types.Mixed,
        required: function() {
            return this.status === 'Completed';
        }
    },
    metadata: {
        requestedBy: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: [true, 'Requester is required'] 
        },
        generatedAt: { 
            type: Date, 
            default: Date.now 
        },
        fileDetails: {
            format: { 
                type: String, 
                enum: ['PDF', 'CSV', 'XLSX'], 
                default: 'PDF' 
            },
            url: { 
                type: String, 
                validate: {
                    validator: v => /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v),
                    message: 'Invalid URL format'
                }
            }
        }
    },
    filters: {
        vehicles: [{ 
            type: Schema.Types.ObjectId, 
            ref: 'Vehicle' 
        }],
        drivers: [{ 
            type: Schema.Types.ObjectId, 
            ref: 'Driver' 
        }],
        includeInactive: { 
            type: Boolean, 
            default: false 
        }
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Processing', 'Completed', 'Failed'], 
        default: 'Pending' 
    }
}, {
    timestamps: true,
    discriminatorKey: 'reportType',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtuals
reportAnalysisSchema.virtual('durationDays').get(function() {
    const diff = this.dateRange.end - this.dateRange.start;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Indexes
reportAnalysisSchema.index({ 'dateRange.start': 1, 'dateRange.end': 1 });
reportAnalysisSchema.index({ status: 1, 'metadata.requestedBy': 1 });

// Validation hooks
reportAnalysisSchema.pre('validate', function(next) {
    const MAX_DATE_RANGE = 365 * 24 * 60 * 60 * 1000;
    
    if (this.dateRange.end - this.dateRange.start > MAX_DATE_RANGE) {
        return next(new Error('Date range cannot exceed 1 year'));
    }
    
    if (this.status === 'Completed' && !this.reportData) {
        return next(new Error('Report data is required for completed reports'));
    }
    
    next();
});

// Base model
const BaseReport = model('Report', reportAnalysisSchema);

// Maintenance Report Discriminator
const MaintenanceReport = BaseReport.discriminator('Maintenance', new Schema({
    reportData: {
        records: [{
            vehicle: { 
                type: Schema.Types.ObjectId, 
                ref: 'Vehicle',
                required: true
            },
            serviceType: { 
                type: String, 
                required: true,
            },
            date: { 
                type: Date, 
                required: true,
                validate: {
                    validator: function(date) {
                        return date >= this.parent().dateRange.start && 
                               date <= this.parent().dateRange.end;
                    },
                    message: 'Service date must be within report date range'
                }
            },
            cost: { 
                type: Number, 
                min: 0,
                required: true
            },
            partsUsed: [String],
            serviceCenter: String
        }],
        totalCost: { 
            type: Number, 
            min: 0,
            required: true
        },
        averageCostPerVehicle: Number
    }
}));

// Driver Performance Discriminator
const DriverPerformanceReport = BaseReport.discriminator('DriverPerformance', new Schema({
    reportData: {
        drivers: [{
            driver: { 
                type: Schema.Types.ObjectId, 
                ref: 'Driver',
                required: true
            },
            tripsCompleted: { 
                type: Number, 
                min: 0,
                required: true
            },
            totalDistance: { 
                type: Number, 
                min: 0,
                required: true
            },
            averageSpeed: { 
                type: Number, 
                min: 0
            },
            safetyScore: { 
                type: Number, 
                min: 0, 
                max: 100,
                required: true
            },
            fuelEfficiency: Number
        }],
        overallStats: {
            averageSafetyScore: Number,
            totalDistance: Number,
            totalTrips: Number
        }
    }
}));

// Vehicle Utilization Discriminator
const VehicleUtilizationReport = BaseReport.discriminator('VehicleUtilization', new Schema({
    reportData: {
        vehicles: [{
            vehicle: { 
                type: Schema.Types.ObjectId, 
                ref: 'Vehicle',
                required: [true, 'Vehicle reference is required']
            },
            totalHours: { 
                type: Number, 
                min: [0, 'Total hours cannot be negative'],
                required: [true, 'Total hours is required']
            },
            operationalHours: { 
                type: Number, 
                min: [0, 'Operational hours cannot be negative']
            },
            distanceTraveled: { 
                type: Number, 
                min: [0, 'Distance traveled cannot be negative']
            },
            utilizationRate: { 
                type: Number, 
                min: [0, 'Utilization rate cannot be below 0%'],
                max: [100, 'Utilization rate cannot exceed 100%'],
                required: [true, 'Utilization rate is required']
            },
            fuelConsumed: { 
                type: Number, 
                min: [0, 'Fuel consumed cannot be negative']
            }
        }],
        summary: {
            averageUtilization: { 
                type: Number, 
                min: [0, 'Average utilization cannot be below 0%'],
                max: [100, 'Average utilization cannot exceed 100%']
            },
            totalFuelConsumed: {
                type: Number,
                min: [0, 'Total fuel consumed cannot be negative']
            },
            peakUtilizationPeriod: {
                start: {
                    type: Date,
                    required: [true, 'Peak period start date is required']
                },
                end: {
                    type: Date,
                    required: [true, 'Peak period end date is required'],
                    validate: {
                        validator: function(value) {
                            return this && this.start && value > this.start;
                        },
                        message: 'End date must be after start date'
                    }
                    
                },
                utilizationRate: {
                    type: Number,
                    min: [0, 'Peak utilization rate cannot be below 0%'],
                    max: [100, 'Peak utilization rate cannot exceed 100%']
                }
            }
        }
    },
    status: {
        type: String,
        enum: {
            values: ['Pending', 'Processing', 'Completed', 'Failed'],
            message: '{VALUE} is not a valid status'
        },
        default: 'Pending'
    },
    metadata: {
        requestedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Requester is required']
        },
        fileDetails: {
            format: {
                type: String,
                enum: ['PDF', 'CSV', 'Excel']
            },
            url: {
                type: String,
                validate: {
                    validator: v => /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v),
                    message: 'Invalid URL format'
                }
            }
        }
    }
}));

// Incident Report Discriminator
const IncidentReport = BaseReport.discriminator('Incident', new Schema({
    reportData: {
        incidents: [{
            type: { 
                type: String, 
                enum: ['Accident', 'MechanicalFailure', 'TrafficViolation', 'Other'],
                required: true
            },
            severity: { 
                type: String, 
                enum: ['Low', 'Medium', 'High'],
                required: true
            },
            vehicle: { 
                type: Schema.Types.ObjectId, 
                ref: 'Vehicle',
                required: true
            },
            driver: { 
                type: Schema.Types.ObjectId, 
                ref: 'Driver' 
            },
            location: String,
            description: String,
            resolved: { 
                type: Boolean, 
                default: false 
            },
            resolutionDetails: String
        }],
        statistics: {
            totalIncidents: Number,
            resolvedCount: Number,
            severityDistribution: {
                low: Number,
                medium: Number,
                high: Number
            }
        }
    }
}));

export default BaseReport;