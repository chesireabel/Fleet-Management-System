import { Schema, model } from 'mongoose';

const locationSchema = new Schema({
    vehicle: { type: Schema.Types.ObjectId,ref: 'Vehicle' , required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timestamp: { type: Date,default:Date.now,required: true}
},{
    timestamps:true


    /*Reconsider these
    speed: { type: Number }, // Speed at the moment of GPS data capture
    altitude: { type: Number }, // Altitude in meters
    heading: { type: Number }, // Direction the vehicle is moving
    createdAt: { type: Date, default: Date.now },
    */
});

const Location = model('Location', locationSchema);

export default Location;
