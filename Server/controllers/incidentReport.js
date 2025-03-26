// controllers/incidentController.js

import IncidentReport from '../models/IncidentReport.js';

// Controller to create a new incident report
export const createIncidentReport = async (req, res) => {
    console.log("Received data:", req.body);  
    try {
        const driverId = req.user.id; // Extract driverId from the authenticated user
    
        if (!driverId) {
          return res.status(401).json({ message: "Unauthorized: Driver ID missing" });
        }

    const { type, severity, vehicle,  location, description } = req.body;


    // Create a new incident report
    const newReport = new IncidentReport({
      type,
      severity,
      vehicle,
      location,
      description,
      createdBy: driverId,
    });

    // Save the new report to the database
    await newReport.save();

    // Respond with success
    res.status(201).json({ message: 'Incident report created successfully', data: newReport });

  } catch (error) {
    console.error('Error creating incident report:', error);
    res.status(500).json({ message: 'Error creating incident report. Please try again.' });
  }
};

// Controller to get incident reports for a specific driver
export const getDriverIncidentReports = async (req, res) => {
    try {
      console.log("User from Token:", req.user); // Debugging line
      const driverId  = req.user.id; // Get driverId from request query
  
      if (!driverId) {
        return res.status(400).json({ message: 'Driver ID is required' });
      }
  
      // Fetch unresolved incidents created by the specific driver
      const reports = await IncidentReport.find({ createdBy: driverId, resolved: false }).sort({ createdAt: -1 });
  
  
      res.status(200).json({
        message: 'Incident reports fetched successfully.',
        notifications,
      });
  
    } catch (error) {
      console.error('Error fetching incident reports:', error);
      res.status(500).json({ message: 'Error fetching incident reports. Please try again.' });
    }
  };











// Controller to get incident reports for notifications (Fleet Manager)
export const getIncidentReports = async (req, res) => {
    try {
      // Fetch unresolved incident reports
      const reports = await IncidentReport.find({ resolved: false }).sort({ createdAt: -1 });
  
      // Format reports for notifications (optional details)
      const notifications = reports.map((report) => ({
        id: report._id,
        type: report.type,
        severity: report.severity,
        vehicle: report.vehicle,
        location: report.location,
        description: report.description,
        createdAt: report.createdAt,
      }));
  
      // Respond with the notifications
      res.status(200).json({
        message: 'Incident reports fetched successfully.',
        notifications,
      });
  
    } catch (error) {
      console.error('Error fetching incident reports:', error);
      res.status(500).json({ message: 'Error fetching incident reports. Please try again.' });
    }
  };
