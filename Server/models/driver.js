import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  
  {
    user: { type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true },

    profilePicture: {
      type: String,
      default: "",
    },
   
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [
        /^\+?(\d[\d-. ]+)?(\([\d-. ]+\))?[\d-. ]+\d$/,
        "Invalid phone number format",
      ],
      index: true,
    },
    licenseNumber: {
      type: String,
      required: [true, "License number is required"],
      unique: true,
      minlength: [8, "License number must be at least 8 characters"],
      maxlength: [20, "License number cannot exceed 20 characters"],
      index: true,
    },
   
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
      validate: {
        validator: function (value) {
          const ageDiff = Date.now() - value.getTime();
          const ageDate = new Date(ageDiff);
          return Math.abs(ageDate.getUTCFullYear() - 1970) >= 18;
        },
        message: "Driver must be at least 18 years old",
      },
    },
    drivingScore: {
      type: Number,
      default: 100,
      min: [0, "Driving score cannot be negative"],
      max: [100, "Driving score cannot exceed 100"],
    },
    activeStatus: {
      type: Boolean,
      default: true,
    },
    hireDate: {
      type: Date,
      default: () => new Date(),
      immutable: true,
    },
    performanceMetrics: {
      totalTrips: { type: Number, default: 0 },
      totalDistance: { type: Number, default: 0 },
      totalFuelConsumed: { type: Number, default: 0 },
      averageSpeed: { type: Number, default: 0 },
      safetyScore: { type: Number, default: 100 },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Compound index for frequently searched fields
driverSchema.virtual('firstName').get(function() {
  return this.user?.firstName;
});

driverSchema.virtual('lastName').get(function() {
  return this.user?.lastName;
});

driverSchema.virtual('email').get(function() {
  return this.user?.email;
});

// Compound index
driverSchema.index({ "user.firstName": 1, "user.lastName": 1 });

const Driver = mongoose.model("Driver", driverSchema);
export default Driver;
