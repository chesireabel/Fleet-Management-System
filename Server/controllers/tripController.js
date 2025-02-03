import Trip from '../models/trip.js';

export const createTrip = async (req, res) => {
    try {
        const { vehicle, driver, startLocation, endLocation, startTime, distanceTraveled, fuelConsumption } = req.body;

        const trip = new Trip({
            vehicle,
            driver,
            startLocation,
            endLocation,
            startTime,
            distanceTraveled,
            fuelConsumption
        });

        await trip.save();
        res.status(201).json(trip);  
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getAllTrips = async (req, res) => {
    try {
        const trips = await Trip.find().populate('vehicle').populate('driver');
        res.status(200).json(trips);  
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getTripById = async (req, res) => {
    try {
        const { tripId } = req.params;
        
        const trip = await Trip.findById(tripId).populate('vehicle').populate('driver');
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        res.status(200).json(trip);  
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const updateTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { endLocation, endTime, tripStatus, fuelConsumption } = req.body;

        const updatedTrip = await Trip.findByIdAndUpdate(
            tripId,
            { endLocation, endTime, tripStatus, gpsCoordinates, fuelConsumption },
            { new: true }  
        );

        if (!updatedTrip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        res.status(200).json(updatedTrip); 
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteTrip = async (req, res) => {
    try {
        const { tripId } = req.params;

        const deletedTrip = await Trip.findByIdAndDelete(tripId);

        if (!deletedTrip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        res.status(200).json({ message: 'Trip deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
