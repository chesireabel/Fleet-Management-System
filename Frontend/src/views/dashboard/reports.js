import React, { useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormSelect,
  CFormInput,
  CButton,
  CAlert,
  CSpinner,
  CTable,
  CBadge
} from '@coreui/react';
import { cilChart, cilCloudDownload } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Constants
const REPORT_TYPES = {
  VEHICLE_UTILIZATION: 'VehicleUtilization',
  MAINTENANCE: 'Maintenance',
  DRIVER_PERFORMANCE: 'DriverPerformance',
  INCIDENT: 'Incident'
};

const REPORT_OPTIONS = [
  { value: '', label: 'Select Report Type' },
  { value: REPORT_TYPES.VEHICLE_UTILIZATION, label: 'Vehicle Utilization' },
  { value: REPORT_TYPES.MAINTENANCE, label: 'Maintenance History' },
  { value: REPORT_TYPES.DRIVER_PERFORMANCE, label: 'Driver Performance' },
  { value: REPORT_TYPES.INCIDENT, label: 'Incident Reports' }
];

const MAX_DATE_RANGE_DAYS = 365;

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [cache, setCache] = useState({});
  const [selectedVehicle, setSelectedVehicle] = useState('All Vehicles');


  const validateForm = () => {
    const errors = {};
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const dateDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    if (!selectedReport) errors.reportType = 'Please select a report type';
    if (!dateRange.start) errors.dateStart = 'Start date is required';
    if (!dateRange.end) errors.dateEnd = 'End date is required';
    
    if (dateRange.start && dateRange.end) {
      if (startDate > endDate) errors.dateRange = 'End date cannot be before start date';
      if (dateDiff > MAX_DATE_RANGE_DAYS) errors.dateRange = `Date range cannot exceed ${MAX_DATE_RANGE_DAYS} days`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchReportData = async (reportType, dates) => {
    try {
      const endpoint = `http://localhost:3000/reportanalyses?reportType=${reportType}&startDate=${dates.start}&endDate=${dates.end}`;
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch report data');
      }

      const data = await response.json();
      console.log("🚀 Frontend Received Data:", JSON.stringify(data, null, 2));
      return data;
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    }
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const cacheKey = `${selectedReport}-${dateRange.start}-${dateRange.end}`;
    
    if (cache[cacheKey]) {
      console.log("🟢 Using Cached Data:", cache[cacheKey]);  
      setReportData(cache[cacheKey]);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await fetchReportData(selectedReport, dateRange,selectedVehicle);

      console.log("📩 Frontend Received Data:", data); 
      
      setReportData(data);
      setCache(prev => ({ ...prev, [cacheKey]: data }));
    } catch (err) {
      setError(err.message || 'Failed to generate report');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportData) return;
  
    try {
      setExporting(true);
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([600, 800]);
      const { height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      let y = height - 50;
  
      // 📌 Header Section
      page.drawText('Fleet Management Report', { x: 50, y, size: 20, font, color: rgb(0, 0, 0.5) });
      y -= 40;
      page.drawText(`Report Type: ${selectedReport.replace(/([A-Z])/g, ' $1')}`, { x: 50, y, size: 14, font: regularFont });
      y -= 20;
      page.drawText(`Date Range: ${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`, { x: 50, y, size: 14, font: regularFont });
      y -= 40;
  
      switch (selectedReport) {
        // 📌 Vehicle Utilization Report
        case REPORT_TYPES.VEHICLE_UTILIZATION:
          page.drawText('Vehicle Utilization Summary', { x: 50, y, size: 16, font });
          y -= 20;
          page.drawText(`Average Utilization: ${reportData.summary?.averageUtilization ?? 'N/A'}%`, { x: 50, y, size: 12, font: regularFont });
          y -= 30;
  
          if (reportData.tableData.length > 0) {
            page.drawText('Vehicle Details:', { x: 50, y, size: 14, font });
            y -= 20;
            reportData.tableData.forEach(vehicle => {
              if (y < 50) { page = pdfDoc.addPage([600, 800]); y = height - 50; }
              page.drawText(
                `Reg: ${vehicle.registrationNumber} | Model: ${vehicle.model} | Utilization: ${vehicle.utilization}% | Hours: ${vehicle.hours} | Fuel: ${vehicle.fuelConsumed}L`,
                { x: 50, y, size: 12, font: regularFont }
              );
              y -= 15;
            });
          } else {
            page.drawText('No vehicle data available.', { x: 50, y, size: 12, font: regularFont });
          }
          break;
  
        // 📌 Maintenance Report
        case REPORT_TYPES.MAINTENANCE:
          page.drawText('Maintenance Records', { x: 50, y, size: 16, font });
          y -= 20;
          page.drawText(`Total Cost: $${reportData.summary?.totalCost ?? 'N/A'}`, { x: 50, y, size: 12, font: regularFont });
          y -= 30;
  
          if (reportData.tableData.length > 0) {
            page.drawText('Maintenance Details:', { x: 50, y, size: 14, font });
            y -= 20;
            reportData.tableData.forEach(record => {
              if (y < 50) { page = pdfDoc.addPage([600, 800]); y = height - 50; }
              page.drawText(
                `Vehicle: ${record.registrationNumber} | Model: ${record.model} | Service: ${record.service} | Cost: $${record.cost} | Date: ${record.date}`,
                { x: 50, y, size: 12, font: regularFont }
              );
              y -= 15;
            });
          } else {
            page.drawText('No maintenance records available.', { x: 50, y, size: 12, font: regularFont });
          }
          break;
  
        // 📌 Driver Performance Report
        case REPORT_TYPES.DRIVER_PERFORMANCE:
          page.drawText('Driver Performance Summary', { x: 50, y, size: 16, font });
          y -= 20;
          page.drawText(`Overall Avg. Safety Score: ${reportData.summary?.overallAverageSafetyScore ?? 'N/A'}`, { x: 50, y, size: 12, font: regularFont });
          y -= 30;
  
          if (reportData.tableData.length > 0) {
            page.drawText('Driver Details:', { x: 50, y, size: 14, font });
            y -= 20;
            reportData.tableData.forEach(driver => {
              if (y < 50) { page = pdfDoc.addPage([600, 800]); y = height - 50; }
              // [CHANGE] Use "driver.name" and "driver.licenseNumber" as per transformation.
              page.drawText(
                `Name: ${driver.name} | License: ${driver.licenseNumber} | Trips: ${driver.trips} | Distance: ${driver.distance}km | Safety Score: ${driver.safetyScore}`,
                { x: 50, y, size: 12, font: regularFont }
              );
              y -= 15;
            });
          } else {
            page.drawText('No driver performance data available.', { x: 50, y, size: 12, font: regularFont });
          }
          break;
  
        // 📌 Incident Report
        case REPORT_TYPES.INCIDENT:
          page.drawText('Incident Reports', { x: 50, y, size: 16, font });
          y -= 20;
          page.drawText(`Total Incidents: ${reportData.summary?.totalIncidents ?? 'N/A'}`, { x: 50, y, size: 12, font: regularFont });
          y -= 30;
  
          if (reportData.tableData.length > 0) {
            page.drawText('Incident Details:', { x: 50, y, size: 14, font });
            y -= 20;
            reportData.tableData.forEach(incident => {
              if (y < 50) { page = pdfDoc.addPage([600, 800]); y = height - 50; }
              // [CHANGE] Use "incident.registration", "incident.model", etc., as per backend transformation.
              page.drawText(
                `Date: ${incident.date} | Vehicle: ${incident.registration} | Type: ${incident.type} | Severity: ${incident.severity} | Resolved: ${incident.resolved ? 'Yes' : 'No'}`,
                { x: 50, y, size: 12, font: regularFont }
              );
              y -= 15;
            });
          } else {
            page.drawText('No incident records available.', { x: 50, y, size: 12, font: regularFont });
          }
          break;
  
        default:
          page.drawText('Invalid report type selected.', { x: 50, y, size: 12, font: regularFont });
          break;
      }
  
      // Export PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedReport}-report-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError('Failed to export PDF: ' + err.message);
    } finally {
      setExporting(false);
    }
  };
  
  const renderReportPreview = () => {
    if (!reportData) return null;
  
    switch (selectedReport) {
      case REPORT_TYPES.VEHICLE_UTILIZATION:
        return (
          <div>
            <h5 className="mb-4">Vehicle Utilization Report</h5>
            <div className="mb-4">
              <Bar 
                data={{
                  labels: reportData.chartData.labels,
                  datasets: reportData.chartData.datasets
                }}
                options={{ responsive: true }}
              />
            </div>
            <CTable striped>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Total Hours</th>
                  <th>Utilization Rate</th>
                  <th>Fuel Consumed</th>
                </tr>
              </thead>
              <tbody>
                {reportData.tableData.map((vehicle, index) => (
                  <tr key={index}>
                    <td>{`${vehicle.registrationNumber} - ${vehicle.model}`}</td>
                    <td>{vehicle.hours}h</td>
                    <td>
                      <CBadge color="primary">{vehicle.utilization}%</CBadge>
                    </td>
                    <td>{vehicle.fuelConsumed}L</td>
                  </tr>
                ))}
              </tbody>
            </CTable>
          </div>
        );
  
      case REPORT_TYPES.MAINTENANCE:
        return (
          <div>
            <h5 className="mb-4">Maintenance History</h5>
            <CTable striped hover>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Cost</th>
                  <th>Service Center</th>
                </tr>
              </thead>
              <tbody>
                {reportData.tableData.map((record, index) => (
                  <tr key={index}>
                    <td>{`${record.registrationNumber} - ${record.model}`}</td>
                    <td>{record.service}</td>
                    <td>{record.date}</td>
                    <td>${record.cost?.toFixed(2)}</td>
                    <td>{record.serviceCenter}</td>
                  </tr>
                ))}
              </tbody>
            </CTable>
          </div>
        );
  
      case REPORT_TYPES.DRIVER_PERFORMANCE:
        return (
          <div>
            <h5 className="mb-4">Driver Performance</h5>
            <div className="mb-4">
              <Bar
                data={{
                  labels: reportData.tableData.map(d => 
                    `${d.name} (${d.licenseNumber})`
                  ) || [],
                  datasets: [{
                    label: 'Safety Score',
                    // [CHANGE] Use d.safetyScore from the transformed data
                    data: reportData.tableData.map(d => d.safetyScore) || [],
                    backgroundColor: 'rgba(75, 192, 192, 0.6)'
                  }]
                }}
                options={{ responsive: true }}
              />
            </div>
            <CTable striped>
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Trips</th>
                  <th>Distance</th>
                  <th>Safety Score</th>
                </tr>
              </thead>
              <tbody>
                {reportData.tableData.map((driver, index) => (
                  <tr key={index}>
                    {/* [CHANGE] Use driver.name and driver.licenseNumber */}
                    <td>{`${driver.name} (${driver.licenseNumber})`}</td>
                    <td>{driver.trips}</td>
                    <td>{driver.distance}km</td>
                    <td>
                      <CBadge color={driver.safetyScore > 90 ? 'success' : 'danger'}>
                        {driver.safetyScore}
                      </CBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </CTable>
          </div>
        );
  
      case REPORT_TYPES.INCIDENT:
        return (
          <div>
            <h5 className="mb-4">Incident Reports</h5>
            <CTable striped hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Resolved</th>
                </tr>
              </thead>
              <tbody>
                {reportData.tableData.map((incident, index) => (
                  <tr key={index}>
                    <td>{new Date(incident.date).toLocaleDateString()}</td>
                    <td>{`${incident.registration} - ${incident.model}`}</td>
                    <td>{incident.driver || 'N/A'}</td>
                    <td>{incident.type}</td>
                    <td>
                      <CBadge color={{
                        Low: 'warning',
                        Medium: 'info',
                        High: 'danger'
                      }[incident.severity]}>
                        {incident.severity}
                      </CBadge>
                    </td>
                    <td>{incident.resolved ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </CTable>
          </div>
        );
  
      default:
        return <p className="text-muted">Select a report type to generate preview</p>;
    }
  };
  
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <h5 className="mb-0">Fleet Management Reports</h5>
          </CCardHeader>
          
          <CCardBody>
            <CForm onSubmit={handleGenerateReport}>
              {error && <CAlert color="danger">{error}</CAlert>}
              
              <CRow className="g-3 mb-4">
                <CCol md={4}>
                  <CFormSelect
                    label="Report Type"
                    value={selectedReport}
                    onChange={(e) => setSelectedReport(e.target.value)}
                    options={REPORT_OPTIONS}
                    invalid={!!validationErrors.reportType}
                  />
                  {validationErrors.reportType && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.reportType}
                    </div>
                  )}
                </CCol>
                
                <CCol md={3}>
                  <CFormInput
                    type="date"
                    label="Start Date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(p => ({ ...p, start: e.target.value }))}
                    invalid={!!validationErrors.dateStart}
                  />
                  {validationErrors.dateStart && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.dateStart}
                    </div>
                  )}
                </CCol>
                
                <CCol md={3}>
                  <CFormInput
                    type="date"
                    label="End Date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(p => ({ ...p, end: e.target.value }))}
                    invalid={!!validationErrors.dateEnd}
                  />
                  {validationErrors.dateEnd && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.dateEnd}
                    </div>
                  )}
                </CCol>
                
                <CCol md={2} className="d-flex align-items-end">
                  <CButton 
                    color="primary" 
                    type="submit"
                    disabled={loading || exporting}
                  >
                    {loading ? (
                      <><CSpinner size="sm" /> Generating...</>
                    ) : (
                      <><CIcon icon={cilChart} className="me-2" />Generate</>
                    )}
                  </CButton>
                </CCol>
              </CRow>
              {validationErrors.dateRange && (
                <CAlert color="danger">{validationErrors.dateRange}</CAlert>
              )}
            </CForm>
  
            <CCard className="mt-4">
              <CCardHeader className="d-flex justify-content-between align-items-center">
                <h6>Report Preview</h6>
                <CButton 
                  color="success" 
                  variant="outline"
                  onClick={handleExportPDF}
                  disabled={!reportData || exporting}
                >
                  {exporting ? (
                    <><CSpinner size="sm" /> Exporting...</>
                  ) : (
                    <><CIcon icon={cilCloudDownload} className="me-2" />Export PDF</>
                  )}
                </CButton>
              </CCardHeader>
              
              <CCardBody>
                {reportData ? (
                  <div className="report-preview">
                    {renderReportPreview()}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <p className="text-muted">
                      {loading ? 'Generating report...' : 'No report generated yet. Select parameters and click "Generate"'}
                    </p>
                  </div>
                )}
              </CCardBody>
            </CCard>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Reports;
