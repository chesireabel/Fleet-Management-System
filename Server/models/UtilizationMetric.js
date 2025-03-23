// api/models/UtilizationMetric.js
const metricSchema = new mongoose.Schema({
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    date: { type: Date, default: Date.now },
    startOdometer: Number,
    endOdometer: Number,
    engineHours: Number,
    idleTime: Number
  });