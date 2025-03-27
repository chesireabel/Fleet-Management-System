// models/IncidentReport.model.js

import mongoose from 'mongoose';

const incidentReportSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Accident', 'MechanicalFailure', 'TrafficViolation', 'Other'],
  },
  severity: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High'],
  },
  vehicle: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
});

const IncidentReport = mongoose.model('IncidentReport', incidentReportSchema);
export default IncidentReport;
