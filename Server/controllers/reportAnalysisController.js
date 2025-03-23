import BaseReport from '../models/reportAnalysis.js';
import { validationResult, check } from 'express-validator';

// In-memory cache implementation
const reportCache = new Map();
const CACHE_TTL = 300000; // 5 minutes in milliseconds

// Report type constants
const REPORT_TYPES = {
  MAINTENANCE: 'Maintenance',
  DRIVER_PERFORMANCE: 'DriverPerformance',
  VEHICLE_UTILIZATION: 'VehicleUtilization',
  INCIDENT: 'Incident'
};

// Generate Report with lookup for related data
export const generateReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const cacheKey = `report:${reportType}:${startDate}:${endDate}`;
    if (reportCache.has(cacheKey)) {
      return res.json(reportCache.get(cacheKey));
    }

    const reports = await BaseReport.aggregate([
      { 
        $match: {
          reportType,
          'dateRange.start': { $lte: new Date(endDate) },
          'dateRange.end': { $gte: new Date(startDate) }
        }
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "reportData.vehicles.vehicle",
          foreignField: "_id",
          as: "vehicleDetails"
        }
      },
      {
        $set: {
          vehicleDetails: {
            $cond: {
              if: { $isArray: "$vehicleDetails" },
              then: "$vehicleDetails",
              else: [{ registrationNumber: "N/A", model: "N/A" }]
            }
          },
          "reportData.vehicles": {
            $map: {
              input: "$reportData.vehicles",
              as: "vehicle",
              in: {
                vehicle: "$$vehicle.vehicle",
                totalHours: "$$vehicle.totalHours",
                distanceTraveled: "$$vehicle.distanceTraveled",
                utilizationRate: "$$vehicle.utilizationRate",
                fuelConsumed: "$$vehicle.fuelConsumed",
                registration: {
                $arrayElemAt: [
                  {
                    $map: {
                      input: "$vehicleDetails",
                      as: "v",
                      in: {
                        $cond: {
                          if: { $eq: [{ $toString: "$$v._id" }, { $toString: "$$vehicle.vehicle" }] },
                          then: "$$v.registrationNumber",
                          else: null
                        }
                      }
                    }
                  },
                  0
                ]
              },
              model: {
                $arrayElemAt: [
                  {
                    $map: {
                      input: "$vehicleDetails",
                      as: "v",
                      in: {
                        $cond: {
                          if: { $eq: [{ $toString: "$$v._id" }, { $toString: "$$vehicle.vehicle" }] },
                          then: "$$v.model",
                          else: null
                        }
                      }
                    }
                  },
                  0
                ]
              }
            }
          }
        }
      }
    }
  ]);
    
    console.log("🚀 Raw Reports from Aggregation:", JSON.stringify(reports, null, 2));
    if (!reports.length) {
      return res.status(404).json({ message: "No reports found for the given criteria" });
    }

    // Transform Data for Frontend
    const transformedReport = transformReportData(reportType, reports);

    // Cache result
    reportCache.set(cacheKey, transformedReport);
    setTimeout(() => reportCache.delete(cacheKey), CACHE_TTL);

    res.json(transformedReport);
  } catch (error) {
    handleReportError(error, res);
  }
};

// Transform Report Data
const transformReportData = (type, reports) => {
  if (!reports.length) return getEmptyReport(type);

  const report = reports[0]; // Use first report
  switch (type) {
    case REPORT_TYPES.VEHICLE_UTILIZATION: {
      // [CHANGE] Vehicle Utilization transformation
      const vehicles = report.reportData.vehicles || [];
      return {
        chartData: {
          labels: vehicles.map(v => `${v.registrationNumber || 'N/A'} - ${v.model || 'N/A'}`),
          datasets: [{
            label: 'Utilization Rate (%)',
            data: vehicles.map(v => v.utilizationRate || 0),
            backgroundColor: 'rgba(54, 162, 235, 0.6)'
          }]
        },
        tableData: vehicles.map(v => ({
          registration: v.registrationNumber || 'N/A',
          model: v.model || 'N/A',
          utilization: v.utilizationRate || 0,
          hours: v.totalHours || 0,
          fuelConsumed: v.fuelConsumed || 0
        })),
        summary: {
          averageUtilization: report.reportData.summary?.averageUtilization || "N/A",
          totalFuelConsumed: report.reportData.summary?.totalFuelConsumed || 0
        }
      };
    }
    case REPORT_TYPES.MAINTENANCE: {
      // [CHANGE] Maintenance transformation
      const records = reports.flatMap(r => r.reportData.records || []);
      return {
        chartData: {
          labels: records.map(r => `${r.vehicle?.registrationNumber || 'Unknown'} - ${r.vehicle?.model || 'Unknown'}`),
          datasets: [{
            label: 'Service Cost ($)',
            data: records.map(r => r.cost || 0),
            backgroundColor: 'rgba(255, 99, 132, 0.6)'
          }]
        },
        tableData: records.map(r => ({
          registration: r.vehicle?.registrationNumber || 'Unknown',
          model: r.vehicle?.model || 'Unknown',
          service: r.serviceType || "Unknown",
          cost: r.cost || 0,
          date: r.date ? new Date(r.date).toLocaleDateString() : "N/A",
          serviceCenter: r.serviceCenter || "N/A"
        })),
        summary: {
          totalCost: records.reduce((sum, r) => sum + (r.cost || 0), 0),
          averageCostPerVehicle: records.length ? records.reduce((sum, r) => sum + (r.cost || 0), 0) / records.length : "N/A"
        }
      };
    }
    case REPORT_TYPES.DRIVER_PERFORMANCE: {
      // [CHANGE] Driver Performance transformation
      const drivers = reports.flatMap(r => r.reportData.drivers || []);
      return {
        chartData: {
          labels: drivers.map(d => `${d.driver?.name || 'Unknown'} (${d.driver?.licenseNumber || 'N/A'})`),
          datasets: [{
            label: 'Safety Score',
            data: drivers.map(d => d.safetyScore || 0),
            backgroundColor: 'rgba(75, 192, 192, 0.6)'
          }]
        },
        tableData: drivers.map(d => ({
          name: d.driver?.name || "Unknown",
          licenseNumber: d.driver?.licenseNumber || "N/A",
          trips: d.tripsCompleted || 0,
          distance: d.totalDistance || 0,
          safetyScore: d.safetyScore || 0,
          averageSpeed: d.averageSpeed || 0,
          fuelEfficiency: d.fuelEfficiency || 0
        })),
        summary: {
          overallAverageSafetyScore: drivers.length ? (drivers.reduce((sum, d) => sum + (d.safetyScore || 0), 0) / drivers.length).toFixed(2) : "N/A",
          totalDistance: drivers.reduce((sum, d) => sum + (d.totalDistance || 0), 0),
          totalTrips: drivers.reduce((sum, d) => sum + (d.tripsCompleted || 0), 0)
        }
      };
    }
    case REPORT_TYPES.INCIDENT: {
      // [CHANGE] Incident transformation
      const incidents = reports.flatMap(r => r.reportData.incidents || []);
      return {
        chartData: {
          labels: incidents.map(i => new Date(i.date).toLocaleDateString()),
          datasets: [{
            label: 'Incident Severity',
            data: incidents.map(i => i.severity === 'Low' ? 1 : i.severity === 'Medium' ? 2 : i.severity === 'High' ? 3 : 0),
            backgroundColor: 'rgba(255, 206, 86, 0.6)'
          }]
        },
        tableData: incidents.map(i => ({
          date: i.date ? new Date(i.date).toLocaleDateString() : "N/A",
          registration: i.vehicle?.registrationNumber || 'Unknown',
          model: i.vehicle?.model || 'Unknown',
          driver: i.driver?.name || 'N/A',
          type: i.type || "Unknown",
          severity: i.severity || "Unknown",
          resolved: i.resolved ? "Yes" : "No"
        })),
        summary: {
          totalIncidents: incidents.length,
          resolvedCount: incidents.filter(i => i.resolved).length,
          severityDistribution: {
            low: incidents.filter(i => i.severity === 'Low').length,
            medium: incidents.filter(i => i.severity === 'Medium').length,
            high: incidents.filter(i => i.severity === 'High').length
          }
        }
      };
    }
    default:
      return reports;
  }
};

// Handle Empty Report Cases
const getEmptyReport = (type) => ({
  chartData: { labels: [], datasets: [{ label: `${type} Data`, data: [], backgroundColor: 'rgba(0, 0, 0, 0.2)' }] },
  tableData: [],
  summary: {}
});

// Handle Errors
const handleReportError = (error, res) => {
  console.error('Report Error:', error);
  res.status(500).json({ message: "Server error", error: error.message });
};

export default { generateReport };
