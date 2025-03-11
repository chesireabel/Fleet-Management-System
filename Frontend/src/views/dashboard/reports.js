import React, { useState, useEffect } from 'react'
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
  CTable
} from '@coreui/react'
import { cilChart, cilCloudDownload } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS } from 'chart.js/auto'

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reportData, setReportData] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})

  const reportTypes = [
    { value: '', label: 'Select Report Type' },
    { value: 'vehicle-utilization', label: 'Vehicle Utilization' },
    { value: 'maintenance-history', label: 'Maintenance History' },
    { value: 'driver-performance', label: 'Driver Performance' },
    { value: 'fuel-consumption', label: 'Fuel Consumption' },
    { value: 'incident-reports', label: 'Incident Reports' }
  ]

  const validateForm = () => {
    const errors = {}
    if (!selectedReport) errors.reportType = 'Please select a report type'
    if (dateRange.start && dateRange.end && new Date(dateRange.start) > new Date(dateRange.end)) {
      errors.dateRange = 'End date cannot be before start date'
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleGenerateReport = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setLoading(true)
      setError('')
      // Simulated API call with actual parameters
      const response = await fetchReportData(selectedReport, dateRange)
      setReportData(response)
    } catch (err) {
      setError('Failed to generate report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchReportData = async (reportType, dates) => {
    // Simulated API response
    await new Promise(resolve => setTimeout(resolve, 1000))
    return mockData[reportType] || null
  }

  const handleExportPDF = () => {
    // PDF export implementation
    alert('PDF export functionality would go here')
  }

  const renderReportPreview = () => {
    if (!reportData) return null

    switch (selectedReport) {
      case 'vehicle-utilization':
        return <Bar data={reportData} />
      case 'maintenance-history':
        return (
          <CTable striped>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Service Type</th>
                <th>Date</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, index) => (
                <tr key={index}>
                  <td>{item.vehicle}</td>
                  <td>{item.serviceType}</td>
                  <td>{item.date}</td>
                  <td>${item.cost}</td>
                </tr>
              ))}
            </tbody>
          </CTable>
        )
      default:
        return <p>No preview available for this report type</p>
    }
  }

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
                    onChange={(e) => {
                      setSelectedReport(e.target.value)
                      setReportData(null)
                    }}
                    options={reportTypes}
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
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                </CCol>
                
                <CCol md={3}>
                  <CFormInput
                    type="date"
                    label="End Date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </CCol>
                
                <CCol md={2} className="d-flex align-items-end">
                  <CButton 
                    color="primary" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <CSpinner size="sm" />
                    ) : (
                      <>
                        <CIcon icon={cilChart} className="me-2" />
                        Generate
                      </>
                    )}
                  </CButton>
                </CCol>
              </CRow>
              {validationErrors.dateRange && (
                <CAlert color="danger">{validationErrors.dateRange}</CAlert>
              )}
            </CForm>

            {/* Report Display Area */}
            <CCard className="mt-4">
              <CCardHeader className="d-flex justify-content-between align-items-center">
                <h6>Report Preview</h6>
                <CButton 
                  color="success" 
                  variant="outline"
                  onClick={handleExportPDF}
                  disabled={!reportData}
                >
                  <CIcon icon={cilCloudDownload} className="me-2" />
                  Export as PDF
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
                      Select a report type and date range to generate preview
                    </p>
                  </div>
                )}
              </CCardBody>
            </CCard>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

// Mock data for demonstration
const mockData = {
  'vehicle-utilization': {
    labels: ['Truck 1', 'Van 2', 'Car 3', 'SUV 4'],
    datasets: [{
      label: 'Hours Utilized',
      data: [65, 59, 80, 81],
      backgroundColor: ['#4BC0C0', '#36A2EB', '#FFCE56', '#FF6384']
    }]
  },
  'maintenance-history': [
    { vehicle: 'Truck 1', serviceType: 'Oil Change', date: '2024-03-15', cost: 150 },
    { vehicle: 'Van 2', serviceType: 'Tire Rotation', date: '2024-03-18', cost: 75 },
    { vehicle: 'Car 3', serviceType: 'Brake Inspection', date: '2024-03-20', cost: 120 }
  ]
}

export default Reports