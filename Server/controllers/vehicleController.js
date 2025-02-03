import Vehicle from '../models/vehicle.js';

// Create a new vehicle record
export const createVehicle = async (req, res) => {
    try {
        const {
            registrationNumber,
            make,
            model,
            year,
            vehicleType,
            fuelType,
            odometerReading,
            insuranceDetails,
            assignedDriver,
            lastServiceDate,
            nextServiceDate,
            gpsCoordinates,
            vehicleHealth
        } = req.body;

        // Create a new vehicle document
        const vehicle = new Vehicle({
            registrationNumber,
            make,
            model,
            year,
            vehicleType,
            fuelType,
            odometerReading,
            insuranceDetails,
            assignedDriver,
            lastServiceDate,
            nextServiceDate,
            gpsCoordinates,
            vehicleHealth
        });

        // Save the vehicle document to the database
        await vehicle.save();
        res.status(201).json(vehicle);  // Return the created vehicle
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all vehicles
export const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find().populate('assignedDriver');
        res.status(200).json(vehicles);  // Return all vehicles
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get a specific vehicle by ID
export const getVehicleById = async (req, res) => {
    try {
        const { vehicleId } = req.params;

        const vehicle = await Vehicle.findById(vehicleId).populate('assignedDriver');
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        res.status(200).json(vehicle);  // Return the vehicle
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update a vehicle record
export const updateVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { 
            make, 
            model, 
            year, 
            vehicleType, 
            fuelType, 
            odometerReading, 
            insuranceDetails, 
            assignedDriver, 
            lastServiceDate, 
            nextServiceDate, 
            gpsCoordinates, 
            vehicleHealth 
        } = req.body;

        // Find and update the vehicle document
        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            vehicleId,
            { 
                make, 
                model, 
                year, 
                vehicleType, 
                fuelType, 
                odometerReading, 
                insuranceDetails, 
                assignedDriver, 
                lastServiceDate, 
                nextServiceDate, 
                gpsCoordinates, 
                vehicleHealth 
            },
            { new: true }  // Return the updated document
        );

        if (!updatedVehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        res.status(200).json(updatedVehicle);  // Return the updated vehicle
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a vehicle record
export const deleteVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.params;

        // Find and delete the vehicle document
        const deletedVehicle = await Vehicle.findByIdAndDelete(vehicleId);

        if (!deletedVehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        res.status(200).json({ message: 'Vehicle deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
