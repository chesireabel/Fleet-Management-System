// scripts/seedReports.js
/*import mongoose from 'mongoose';
import BaseReport from '../models/reportAnalysis.js';
import Vehicle from '../models/vehicle.js';
import User from '../models/User.js'; // Make sure this model exists

const generateDummyData = async () => {
    // Clear existing data
    await Vehicle.deleteMany({});
    await BaseReport.deleteMany({});
    await User.deleteMany({});

    // Create test user for metadata.requestedBy
    const adminUser = await User.create({
        name: "Terry Njeru",
        email: "njeruterry66@gmail.com",
        role: "fleet_manager",
        password: "tempPassword123" // Add if your User model requires it
    });

    // Create test vehicles
    const vehicles = await Vehicle.insertMany([
        {
            registrationNumber: 'KBN 589U',
            make: 'Toyota',
            model: 'Hilux',
            year: 2023,
            vehicleType: 'Truck',
            fuelType: 'Diesel',
            odometerReading: 15000,
            insuranceDetails: {
                policyNumber: 'POL-001',
                insuranceProvider: 'Kenya Insurance Co.',
                expiryDate: new Date('2025-12-31')
            },
            activeStatus: true,
            lastServiceDate: new Date('2024-01-15'),
            nextServiceDate: new Date('2024-07-15'),
            vehicleHealth: 'Good'
        },
        {
            registrationNumber: 'KCB-002',
            make: 'Isuzu',
            model: 'NPR',
            year: 2022,
            vehicleType: 'Lorry',
            fuelType: 'Petrol',
            odometerReading: 25000,
            insuranceDetails: {
                policyNumber: 'POL-002',
                insuranceProvider: 'Star Insurance',
                expiryDate: new Date('2024-11-30')
            },
            activeStatus: true,
            lastServiceDate: new Date('2023-12-01'),
            nextServiceDate: new Date('2024-06-01'),
            vehicleHealth: 'Excellent'
        }
    ]);

    // Generate 30 days of data
    for (const vehicle of vehicles) {
        let currentOdometer = vehicle.odometerReading;
        const usageData = [];
        const maintenanceData = [];
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(Date.now() - (30 - i) * 86400000);
            const dailyDistance = Math.floor(150 + Math.random() * 50);
            const fuelUsed = 15 + Math.random() * 5;
            
            usageData.push({
                date,
                startOdometer: currentOdometer,
                endOdometer: currentOdometer + dailyDistance,
                fuelUsed,
                engineHours: 8 + Math.floor(Math.random() * 4)
            });

            currentOdometer += dailyDistance;

            if (currentOdometer - vehicle.odometerReading >= 5000) {
                maintenanceData.push({
                    date,
                    serviceType: ['Oil Change', 'Tire Rotation', 'Brake Check'][Math.floor(Math.random()*3)],
                    cost: [5000, 7500, 10000][Math.floor(Math.random()*3)],
                    description: 'Routine maintenance'
                });
            }
        }

        vehicle.usageMetrics = usageData;
        vehicle.maintenanceHistory = maintenanceData;
        vehicle.odometerReading = currentOdometer;
        await vehicle.save();
    }

    // Generate reports with proper metadata
    await generateVehicleUtilizationReports(adminUser._id);
    await generateMaintenanceReports(adminUser._id);
    
    console.log('Dummy data generation successful!');
    process.exit();
};

const generateVehicleUtilizationReports = async (userId) => {
    const vehicles = await Vehicle.find().lean();
    const reportData = vehicles.map(vehicle => ({
        vehicle: vehicle._id,
        totalHours: vehicle.usageMetrics.reduce((sum, m) => sum + m.engineHours, 0),
        distanceTraveled: vehicle.odometerReading - vehicle.usageMetrics[0].startOdometer,
        utilizationRate: (vehicle.usageMetrics.reduce((sum, m) => sum + m.engineHours, 0) / (30 * 24)) * 100,
        fuelConsumed: vehicle.usageMetrics.reduce((sum, m) => sum + m.fuelUsed, 0)
    }));

     // Get the peak utilization period (last 3 days as example)
     const peakStart = new Date();
const peakEnd = new Date(peakStart.getTime() + 24 * 60 * 60 * 1000 + 1); // Add 1 extra ms

console.log("Peak Start:", peakStart);
console.log("Peak End:", peakEnd);

     
if (peakEnd <= peakStart) {
    console.error("Validation Error: Peak End must be after Peak Start!", { peakStart, peakEnd });
}

     

  await BaseReport.create({
        reportType: 'VehicleUtilization',
        dateRange: {
            start: new Date(Date.now() - 30 * 86400000),
            end: new Date()
        },
        reportData: {
            vehicles: reportData,
            summary: {
                averageUtilization: reportData.reduce((sum, v) => sum + v.utilizationRate, 0) / reportData.length,
                totalFuelConsumed: reportData.reduce((sum, v) => sum + v.fuelConsumed, 0),
                peakUtilizationPeriod: {
                    start: peakStart,
                    end: peakEnd,
                    utilizationRate: 92.5
                }
            }
        },
        metadata: {
            requestedBy: userId,
            generatedAt: new Date(),
            fileDetails: {
                format: 'PDF',
                url: 'http://localhost:3000/reports/vehicle-utilization.pdf' // Valid URL
            }
        },
        status: 'Completed' // Match enum exactly
    });
};


const generateMaintenanceReports = async (userId) => {
    const vehicles = await Vehicle.find().populate('maintenanceHistory');

    const records = vehicles.flatMap(v =>
        v.maintenanceHistory.map(m => ({
            vehicle: v._id,
            serviceType: m.serviceType,
            date: m.date,
            cost: m.cost
        }))
    );

    const totalCost = records.reduce((sum, record) => sum + record.cost, 0); // Calculate total cost

    await BaseReport.create({
        reportType: 'Maintenance',
        dateRange: {
            start: new Date(Date.now() - 30 * 86400000),
            end: new Date()
        },
        reportData: {
            records,
            totalCost // Add total cost to fix the error
        },
        metadata: {
            requestedBy: userId,
            generatedAt: new Date(),
            fileDetails: {
                format: 'PDF',
                url: 'http://localhost:3000/reports/maintenance.pdf'
            }
        },
        status: 'Completed'
    });
};

const DB_URL = "mongodb+srv://chesireabel1:aBelitO8!@cluster0.spcfyt8.mongodb.net/fleet_management_db?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("Connected to MongoDB Atlas...");
  return generateDummyData();
})
.catch((err) => console.error("MongoDB connection error:", err));

