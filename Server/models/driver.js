import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
    firstName: { type:String, required: true},
    lastName: { type:String, required: true},
    phone: {type:String, required: true},
    licenseNumber:{type:String, required:true,unique:true},
    email:{type:String,required:true}

/* REVISIT!!!
    assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    drivingScore: { type: Number, default: 100 },
    activeStatus: { type: Boolean, default: true },
    hireDate: { type: Date, default: Date.now },
    lastLogin: { type: Date },
    */
});

const Driver = mongoose.model('Driver', driverSchema);
export default Driver;