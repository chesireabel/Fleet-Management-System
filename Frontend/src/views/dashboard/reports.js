import React, { useState } from 'react'
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
  CSpinner
} from '@coreui/react'
import { cilChart, cilCloudDownload } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reportTypes = [
    { value: '', label: 'Select Report Type' },
    { value: 'vehicle-utilization', label: 'Vehicle Utilization' },
    { value: 'maintenance-history', label: 'Maintenance History' },
    { value: 'driver-performance', label: 'Driver Performance' },
    { value: 'fuel-consumption', label: 'Fuel Consumption' },
    { value: 'incident-reports', label: 'Incident Reports' }
  ]

  const handleGenerateReport = async (e) => {
    e.preventDefault()
    if (!selectedReport) {
      setError('Please select a report type')
      return
    }
    
    try {
      setLoading(true)
      setError('')
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (err) {
      setError('Failed to generate report. Please try again.')
    } finally {
      setLoading(false)
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
                    onChange={(e) => setSelectedReport(e.target.value)}
                    options={reportTypes}
                    required
                  />
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
            </CForm>

            {/* Report Display Area */}
            <CCard className="mt-4">
              <CCardHeader className="d-flex justify-content-between align-items-center">
                <h6>Report Preview</h6>
                <CButton color="success" variant="outline">
                  <CIcon icon={cilCloudDownload} className="me-2" />
                  Export as PDF
                </CButton>
              </CCardHeader>
              
              <CCardBody>
                {selectedReport ? (
                  <div className="report-preview">
                    {/* Placeholder for chart/table integration */}
                    <div className="p-4 text-center border rounded bg-light">
                      <p className="text-medium-emphasis">
                        {`${reportTypes.find(r => r.value === selectedReport)?.label} preview will appear here`}
                      </p>
                      <p className="small text-muted">
                        (Chart/Table integration area)
                      </p>
                    </div>
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

export default Reports