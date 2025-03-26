import { Schema, model } from 'mongoose';
import mongoose from "mongoose";


const BaseReportSchema = new Schema({
    reportType: {
        type: String,
        enum: ['maintenance', 'driverperformance', 'vehicleutilization', 'incident'],
        required: [true, 'Report type is required'],
        lowercase: true,  // Normalize to lowercase
        trim: true,       // Remove unnecessary spaces
    },

    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Failed'],
        default: 'Pending',
    },

    dateRange: {
        start: {
            type: Date,
            required: true,
            validate: {
                validator: function (value) {
                    return value < this.dateRange.end;  // Ensure start < end
                },
                message: 'Start date must be before end date',
            }
        },
        end: {
            type: Date,
            required: true,
        },
    },

    reportData: {
        type: Schema.Types.Mixed,
        default: null,
    },

    filters: {
        type: Schema.Types.Mixed,  // Allows dynamic filters for reports
        default: {},
    },

    metadata: {
        requestedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        generatedAt: {
            type: Date,
            default: Date.now,
        },
    },

    fileDetails: {
        filename: String,
        url: {
            type: String,
            validate: {
                validator: function (v) {
                    return /^(https?:\/\/)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(v);
                },
                message: 'Invalid file URL format',
            }
        }
    },
},
{
    timestamps: true,
    discriminatorKey: 'reportType',  // Allows extending with specific reports
});

// 🔹 Ensure reportData is required if the report is marked as "Completed"
BaseReportSchema.pre('save', function (next) {
    if (this.status === 'Completed' && !this.reportData) {
        return next(new Error('Report data is required for completed reports'));
    }
    next();
});

// 🔹 Indexing for faster queries
BaseReportSchema.index({ "dateRange.start": 1 });
BaseReportSchema.index({ "dateRange.end": 1 });
BaseReportSchema.index({ "metadata.requestedBy": 1 });

const BaseReport = mongoose.model('BaseReport', BaseReportSchema);
export default BaseReport;
