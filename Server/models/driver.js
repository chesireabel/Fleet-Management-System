import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true 
    },

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

  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true }, // Ensure virtuals are included in JSON output
    toObject: { virtuals: true }
  }
);

// **Virtuals to retrieve user details (Ensure you populate the user field when querying)**
driverSchema.virtual("firstName").get(function () {
  return this.user?.firstName || "Unknown";
});

driverSchema.virtual("lastName").get(function () {
  return this.user?.lastName || "Unknown";
});

driverSchema.virtual("email").get(function () {
  return this.user?.email || "Unknown";
});

// **Indexes**
driverSchema.index({ user: 1, licenseNumber: 1 });

const Driver = mongoose.model("Driver", driverSchema);
export default Driver;
