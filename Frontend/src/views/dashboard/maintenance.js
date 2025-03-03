import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CAlert,
  CForm,
  CFormInput,
  CFormLabel,
  CInputGroup
} from '@coreui/react'
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { format, parseISO, isValid, isAfter } from 'date-fns'

const API_URL = import.meta.env.VITE_API_URL

const Maintenance = () => {
  const [state, setState] = useState({
    records: [],
    loading: false,
    error: '',
    success: '',
    modalVisible: false,
    editingRecord: null,
    isSubmitting: false,
    formData: {
      Vehicle: '',
      ServiceType: '',
      ServiceDate: '',
      NextServiceDate: '',
      ServiceCenter: '',
      Cost: '',
      Notes: ''
    },
    filterVehicle: ''
  })

  useEffect(() => {
    const savedRecords = JSON.parse(localStorage.getItem('maintenanceRecords')) || []
    setState(prev => ({ ...prev, records: savedRecords }))
  }, [])

  useEffect(() => {
    localStorage.setItem('maintenanceRecords', JSON.stringify(state.records))
  }, [state.records])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: name === 'cost' ? Number(value) : value
      }
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const { formData, editingRecord, records } = state

    // Validation
    const serviceDate = parseISO(formData.ServiceDate)
    const nextServiceDate = parseISO(formData.NextServiceDate)
    
    if (!isValid(serviceDate) || !isValid(nextServiceDate)) {
      setState(prev => ({ ...prev, error: 'Invalid date format' }))
      return
    }
    
    if (isAfter(serviceDate, nextServiceDate)) {
      setState(prev => ({ ...prev, error: 'Next service date must be after service date' }))
      return
    }

    const newRecord = { 
      ...formData,
      id: editingRecord || Date.now(),
      cost: Number(formData.Cost)
    }

    setState(prev => ({
      ...prev,
      records: editingRecord
        ? prev.records.map(record => record.id === editingRecord ? newRecord : record)
        : [newRecord, ...prev.records],
      modalVisible: false,
      editingRecord: null,
      formData: {
        Vehicle: '',
        ServiceType: '',
        ServiceDate: '',
        NextServiceDate: '',
        ServiceCenter: '',
        Cost: '',
        Notes: ''
      },
      success: editingRecord ? 'Record updated!' : 'Record created!',
      error: ''
    }))
  }

  const handleDelete = (id) => {
    setState(prev => ({
      ...prev,
      records: prev.records.filter(record => record.id !== id),
      success: 'Record deleted successfully'
    }))
  }

  const filteredRecords = state.records.filter(record =>
    record.vehicle.toLowerCase().includes(state.filterVehicle.toLowerCase())
  )

  const tableFields = [
    'Vehicle', 'ServiceType', 'ServiceDate', 
    'NextServiceDate', 'ServiceCenter', 'Cost', 'Notes'
  ]

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Maintenance Records</h5>
            <CButton 
              color="primary"
              onClick={() => setState(prev => ({ ...prev, modalVisible: true }))}
            >
              <CIcon icon={cilPlus} className="me-2" />
              Add Maintenance
            </CButton>
          </CCardHeader>

          <CCardBody>
            <div className="mb-4 position-relative" style={{ maxWidth: '300px' }}>
              <CFormInput
                placeholder="Filter by vehicle"
                value={state.filterVehicle}
                onChange={(e) => setState(prev => ({ ...prev, filterVehicle: e.target.value }))}
              />
            </div>

            {state.error && <CAlert color="danger">{state.error}</CAlert>}
            {state.success && <CAlert color="success">{state.success}</CAlert>}

            <CTable hover responsive>
              <CTableHead color="light">
                <CTableRow>
                  {tableFields.map(field => (
                    <CTableHeaderCell key={field}>
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </CTableHeaderCell>
                  ))}
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredRecords.map(record => (
                  <CTableRow key={record.id}>
                    {tableFields.map(field => (
                      <CTableDataCell key={`${record.id}-${field}`}>
                        {field.includes('Date') && record[field] 
                          ? format(parseISO(record[field]), 'MM/dd/yyyy')
                          : field === 'cost'
                          ? `$${Number(record[field]).toFixed(2)}`
                          : record[field]}
                      </CTableDataCell>
                    ))}
                    <CTableDataCell>
                      <CButton 
                        color="warning" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setState(prev => ({
                          ...prev,
                          editingRecord: record.id,
                          modalVisible: true,
                          formData: record
                        }))}
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton
                        color="danger"
                        variant="outline"
                        size="sm"
                        className="ms-2"
                        onClick={() => handleDelete(record.id)}
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>

        <CModal 
          visible={state.modalVisible} 
          onDismiss={() => setState(prev => ({ ...prev, modalVisible: false }))}
          size="lg"
        >
          <CModalHeader closeButton>
            <CModalTitle>
              {state.editingRecord ? 'Edit Maintenance Record' : 'New Maintenance Record'}
            </CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm onSubmit={handleSubmit}>
              <CRow className="g-3">
                {Object.entries(state.formData).map(([key, value]) => (
                  <CCol md={6} key={key}>
                    <CFormLabel>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </CFormLabel>
                    <CFormInput
                      type={key.includes('Date') ? 'date' : key === 'cost' ? 'number' : 'text'}
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                      min={key === 'cost' ? '0' : undefined}
                      step={key === 'cost' ? '0.01' : undefined}
                      required={!['nextServiceDate', 'notes'].includes(key)}
                    />
                  </CCol>
                ))}
              </CRow>
              <div className="mt-4 d-flex justify-content-end gap-2">
                <CButton 
                  color="secondary" 
                  onClick={() => setState(prev => ({ ...prev, modalVisible: false }))}
                >
                  Cancel
                </CButton>
                <CButton 
                  color="primary" 
                  type="submit"
                  disabled={state.isSubmitting}
                >
                  {state.editingRecord ? 'Update' : 'Create'}
                </CButton>
              </div>
            </CForm>
          </CModalBody>
        </CModal>
      </CCol>
    </CRow>
  )
}

export default Maintenance