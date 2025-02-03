import MaintenanceRecord from '../models/maintainence.js';

export const createMaintenance = async (req, res) => {
    try {
        const { vehicle, serviceType, serviceDate, nextServiceDate, serviceCenter, notes, cost } = req.body;

        const maintenance = new MaintenanceRecord({
            vehicle,
            serviceType,
            serviceDate,
            nextServiceDate,
            serviceCenter,
            notes,
            cost
        });

        await maintenance.save();
        res.status(201).json(maintenance);  
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getAllMaintenances = async (req, res) => {
    try {
        const maintenances = await MaintenanceRecord.find().populate('vehicle');  
        res.status(200).json(maintenances); 
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getMaintenanceByVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.params;

        const maintenances = await MaintenanceRecord.find({ vehicle: vehicleId }).populate('vehicle');

        if (!maintenances || maintenances.length === 0) {
            return res.status(404).json({ message: 'No maintenance records found for this vehicle' });
        }

        res.status(200).json(maintenances);  
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const updateMaintenance = async (req, res) => {
    try {
        const { maintenanceId } = req.params;
        const { serviceType, serviceDate, nextServiceDate, serviceCenter, notes, cost } = req.body;

        const updatedMaintenance = await MaintenanceRecord.findByIdAndUpdate(
            maintenanceId,
            { serviceType, serviceDate, nextServiceDate, serviceCenter, notes, cost },
            { new: true }  
        );

        if (!updatedMaintenance) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }

        res.status(200).json(updatedMaintenance); 
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteMaintenance = async (req, res) => {
    try {
        const { maintenanceId } = req.params;

        const deletedMaintenance = await MaintenanceRecord.findByIdAndDelete(maintenanceId);

        if (!deletedMaintenance) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }

        res.status(200).json({ message: 'Maintenance record deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
