import Location, { find } from '../models/location';

export async function createLocation(req, res) {
    try {
        const { vehicle, latitude, longitude, timestamp } = req.body;

        const location = new Location({
            vehicle,
            latitude,
            longitude,
            timestamp
        });

        await location.save();
        res.status(201).json(location);  
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

export async function getLocations(req, res) {
    try {
        const locations = await find().populate('vehicle');  
        res.status(200).json(locations); 
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

export async function getLocationByVehicle(req, res) {
    try {
        const { vehicleId } = req.params;

        const location = await find({ vehicle: vehicleId })
                                       .sort({ timestamp: -1 })
                                       .limit(1); 
        if (!location || location.length === 0) {
            return res.status(404).json({ message: 'Location not found for this vehicle' });
        }

        res.status(200).json(location[0]);  
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}
