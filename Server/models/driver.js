import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
    firstName: { 
        type: String, 
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: { 
        type: String, 
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^\+?(\d[\d-. ]+)?(\([\d-. ]+\))?[\d-. ]+\d$/, 'Invalid phone number format'],
        index: true
    },
    licenseNumber: {
        type: String,
        required: [true, 'License number is required'],
        unique: true,
        minlength: [8, 'License number must be at least 8 characters'],
        maxlength: [20, 'License number cannot exceed 20 characters'],
        index: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required'],
        validate: {
            validator: function(value) {
                const ageDiff = Date.now() - value.getTime();
                const ageDate = new Date(ageDiff);
                return Math.abs(ageDate.getUTCFullYear() - 1970) >= 18;
            },
            message: 'Driver must be at least 18 years old'
        }
    },
    
    drivingScore: { 
        type: Number, 
        default: 100,
        min: [0, 'Driving score cannot be negative'],
        max: [100, 'Driving score cannot exceed 100']
    },
    activeStatus: { 
        type: Boolean, 
        default: true 
    },
    hireDate: { 
        type: Date, 
        default: Date.now,
        immutable: true
    },
    
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Compound index for frequently searched fields
driverSchema.index({ firstName: 1, lastName: 1 });

const Driver = mongoose.model('Driver', driverSchema);
export default Driver;