import React, { useState } from 'react'
import {
  CForm,
  CFormInput,
  CFormSelect,
  CFormLabel,
  CButton,
  CRow,
  CCol
} from '@coreui/react'

const VehicleForm = ({ vehicle, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    registrationNumber: vehicle?.registrationNumber || '',
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    year: vehicle?.year || '',
    vehicleType: vehicle?.vehicleType || '',
    fuelType: vehicle?.fuelType || '',
    odometerReading: vehicle?.odometerReading || '',
    insuranceDetails: {
      policyNumber: vehicle?.insuranceDetails?.policyNumber || '',
      insuranceProvider: vehicle?.insuranceDetails?.insuranceProvider || '',
      expiryDate: vehicle?.insuranceDetails?.expiryDate || '',
    },
    vehicleHealth: vehicle?.vehicleHealth || 'Good',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('insurance.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        insuranceDetails: { ...prev.insuranceDetails, [child]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      year: Number(formData.year),
      odometerReading: Number(formData.odometerReading),
    })
  }

  return (
    <CForm onSubmit={handleSubmit} className="d-flex flex-column gap-4">
      <CRow className="g-4">
        <CCol md={6}>
          <CFormLabel className="fw-medium">Registration Number</CFormLabel>
          <CFormInput
            type="text"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
            required
          />
        </CCol>
        <CCol md={6}>
          <CFormLabel className="fw-medium">Make</CFormLabel>
          <CFormInput
            type="text"
            name="make"
            value={formData.make}
            onChange={handleChange}
            required
          />
        </CCol>
      </CRow>

      <CRow className="g-4">
        <CCol md={6}>
          <CFormLabel className="fw-medium">Model</CFormLabel>
          <CFormInput
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
          />
        </CCol>
        <CCol md={6}>
          <CFormLabel className="fw-medium">Year</CFormLabel>
          <CFormInput
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            min="1900"
            max={new Date().getFullYear() + 1}
            required
          />
        </CCol>
      </CRow>

      <CRow className="g-4">
        <CCol md={3}>
          <CFormLabel className="fw-medium">Vehicle Type</CFormLabel>
          <CFormSelect
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleChange}
            required
          >
            <option value="">Select Type</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Truck">Truck</option>
          </CFormSelect>
        </CCol>
        <CCol md={3}>
          <CFormLabel className="fw-medium">Fuel Type</CFormLabel>
          <CFormSelect
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            required
          >
            <option value="">Select Fuel</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
          </CFormSelect>
        </CCol>
        <CCol md={3}>
          <CFormLabel className="fw-medium">Odometer (km)</CFormLabel>
          <CFormInput
            type="number"
            name="odometerReading"
            value={formData.odometerReading}
            onChange={handleChange}
          />
        </CCol>
        <CCol md={3}>
          <CFormLabel className="fw-medium">Vehicle Health</CFormLabel>
          <CFormSelect
            name="vehicleHealth"
            value={formData.vehicleHealth}
            onChange={handleChange}
          >
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </CFormSelect>
        </CCol>
      </CRow>

      <CRow className="g-4">
        <CCol md={4}>
          <CFormLabel className="fw-medium">Policy Number</CFormLabel>
          <CFormInput
            type="text"
            name="insurance.policyNumber"
            value={formData.insuranceDetails.policyNumber}
            onChange={handleChange}
          />
        </CCol>
        <CCol md={4}>
          <CFormLabel className="fw-medium">Insurance Provider</CFormLabel>
          <CFormInput
            type="text"
            name="insurance.insuranceProvider"
            value={formData.insuranceDetails.insuranceProvider}
            onChange={handleChange}
          />
        </CCol>
        <CCol md={4}>
          <CFormLabel className="fw-medium">Expiry Date</CFormLabel>
          <CFormInput
            type="date"
            name="insurance.expiryDate"
            value={formData.insuranceDetails.expiryDate}
            onChange={handleChange}
          />
        </CCol>
      </CRow>

      <div className="d-flex justify-content-end gap-2 pt-4 border-top">
        <CButton color="secondary" onClick={onCancel}>
          Cancel
        </CButton>
        <CButton color="primary" type="submit">
          {vehicle ? 'Save Changes' : 'Add Vehicle'}
        </CButton>
      </div>
    </CForm>
  )
}

export default VehicleForm