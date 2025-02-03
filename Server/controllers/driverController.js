import Driver from "../models/driver.js";
import mongoose from "mongoose";

export const createDriver = async (req, res) => {
    try {
        const driver = new Driver(req.body);
        await driver.save();
        res.status(201).json(driver);
    } catch (err) {
        // Handle duplicate key errors (e.g., unique constraint violations)
        if (err.code === 11000) {
            return res.status(400).json({ error: "Driver with this data already exists." });
        }
        // Handle validation errors (e.g., required fields missing)
        if (err instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ error: err.message });
        }
        res.status(400).json({ error: err.message });
    }
};

export const getDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find();
        res.status(200).json(drivers);
    } catch (err) {
        res.status(500).json({ error: "Server error while fetching drivers." });
    }
};

export const getDriverById = async (req, res) => {
    try {
        // Check if the provided ID is valid to prevent CastError
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid driver ID format." });
        }

        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found.' });
        }
        res.status(200).json(driver);
    } catch (err) {
        // Catch any unexpected errors
        res.status(500).json({ error: "Server error while fetching the driver." });
    }
};