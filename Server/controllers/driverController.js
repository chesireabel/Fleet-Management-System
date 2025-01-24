import Driver from "../models/driver";

exports.createDriver = async (req, res) => {
    try {
        const driver = new Driver(req.body);
        await driver.save();
        res.status(201).json(driver);
    }catch (err){
        res.status(400).json({erroe: err.message});
    }
};

exports.getDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find();
        res.status(200).json(drivers);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getDriverById = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        res.status(200).json(driver);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};