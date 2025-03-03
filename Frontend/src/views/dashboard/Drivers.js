import React, { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
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
  CModalFooter,
  CAlert,
  CForm,
  CFormInput,
  CFormCheck,
  CFormLabel,
  CInputGroup,
  CImage,
  CCollapse,
  CBadge
} from '@coreui/react'
import { cilPlus, cilPencil, cilTrash, cilChevronBottom, cilChevronTop } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const API_URL = import.meta.env.VITE_API_URL

const Drivers = () => {
  const [state, setState] = useState({
    drivers: [],
    loading: false,
    error: '',
    success: '',
    modalVisible: false,
    editingDriver: null,
    isSubmitting: false,
    formData: {
      firstName: '',
      lastName: '',
      licenseNumber: '',
      phone: '',
      email: '',
      dateOfBirth: '',
      drivingScore: 0,
      activeStatus: true,
      hireDate: new Date().toISOString().split('T')[0],
      profilePicture: null
    }
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [expandedDriver, setExpandedDriver] = useState(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, driverId: null })
  const isMounted = useRef(true)
  const abortControllerRef = useRef()

  const fetchDrivers = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: '' }))
    try {
      const response = await axios.get(`${API_URL}/drivers`)
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          drivers: response.data.data?.drivers || [],
          loading: false
        }))
      }
    } catch (err) {
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          error: err.response?.data?.message || 'Failed to load drivers',
          loading: false
        }))
      }
    }
  }, [])

  useEffect(() => {
    isMounted.current = true
    fetchDrivers()
    return () => {
      isMounted.current = false
      abortControllerRef.current?.abort()
    }
  }, [fetchDrivers])

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, success: '' }))
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [state.success])

  const toggleDriverDetails = (driverId) => {
    setExpandedDriver(prev => prev === driverId ? null : driverId)
  }

  const handleDeleteConfirmation = (driverId) => {
    setDeleteConfirmation({ show: true, driverId })
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/drivers/${deleteConfirmation.driverId}`)
      setState(prev => ({
        ...prev,
        drivers: prev.drivers.filter(d => d._id !== deleteConfirmation.driverId),
        success: 'Driver deleted successfully'
      }))
      fetchDrivers()
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err.response?.data?.message || 'Delete failed'
      }))
    } finally {
      setDeleteConfirmation({ show: false, driverId: null })
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: type === 'checkbox' ? checked : 
                type === 'file' ? files[0] : value
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const controller = new AbortController()
    abortControllerRef.current = controller
    
    try {
      setState(prev => ({ ...prev, error: '', isSubmitting: true }))
      const { editingDriver, formData } = state
      const data = new FormData()

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === 'profilePicture' && value instanceof File) {
            data.append(key, value, value.name)
          } else {
            data.append(key, value)
          }
        }
      })

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: controller.signal
      }

      const response = editingDriver 
        ? await axios.put(`${API_URL}/drivers/${editingDriver._id}`, data, config)
        : await axios.post(`${API_URL}/drivers`, data, config)

      setState(prev => ({
        ...prev,
        modalVisible: false,
        success: `Driver ${editingDriver ? 'updated' : 'created'} successfully!`,
        isSubmitting: false,
        formData: {
          firstName: '',
          lastName: '',
          licenseNumber: '',
          phone: '',
          email: '',
          dateOfBirth: '',
          drivingScore: 0,
          activeStatus: true,
          hireDate: new Date().toISOString().split('T')[0],
          profilePicture: null
        }
      }))
      
      fetchDrivers()
    } catch (error) {
      if (isMounted.current && !axios.isCancel(error)) {
        setState(prev => ({
          ...prev,
          error: error.response?.data?.message || "Operation failed. Please check your inputs.",
          isSubmitting: false
        }))
      }
    }
  }

  const filteredDrivers = state.drivers.filter(driver =>
    `${driver.firstName || ''} ${driver.lastName || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    if (state.modalVisible && state.editingDriver) {
      setState(prev => ({
        ...prev,
        formData: {
          ...state.editingDriver,
          profilePicture: state.editingDriver.profilePicture || null
        }
      }))
    }
  }, [state.modalVisible, state.editingDriver])

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Driver Management</h5>
            <CButton 
              color="primary"
              onClick={() => setState(prev => ({ ...prev, modalVisible: true }))}
            >
              <CIcon icon={cilPlus} className="me-2" />
              Add Driver
            </CButton>
          </CCardHeader>

          <CCardBody>
            <div className="mb-4 position-relative" style={{ maxWidth: '300px' }}>
              <CFormInput
                placeholder="Search drivers..."
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {state.error && <CAlert color="danger">{state.error}</CAlert>}
            {state.success && <CAlert color="success">{state.success}</CAlert>}

            <CTable hover responsive>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell style={{ width: '40px' }}></CTableHeaderCell>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>License</CTableHeaderCell>
                  <CTableHeaderCell>Phone</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {state.loading ? (
                  <CTableRow>
                    <CTableDataCell colSpan={6} className="text-center">
                      <CSpinner color="primary" />
                    </CTableDataCell>
                  </CTableRow>
                ) : filteredDrivers.map(driver => (
                  <React.Fragment key={driver._id}>
                    <CTableRow>
                      <CTableDataCell>
                        <CButton 
                          color="link"
                          onClick={() => toggleDriverDetails(driver._id)}
                        >
                          <CIcon 
                            icon={expandedDriver === driver._id ? cilChevronTop : cilChevronBottom} 
                          />
                        </CButton>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex align-items-center">
                          {driver.profilePicture && (
                            <CImage 
                              thumbnail 
                              src={driver.profilePicture} 
                              width={50} 
                              className="me-3"
                            />
                          )}
                          <div>
                            {driver.firstName} {driver.lastName}
                            <div className="small text-muted">{driver.email}</div>
                          </div>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>{driver.licenseNumber}</CTableDataCell>
                      <CTableDataCell>{driver.phone}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={driver.activeStatus ? 'success' : 'danger'}>
                          {driver.activeStatus ? 'Active' : 'Inactive'}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton 
                          color="warning" 
                          variant="outline" 
                          size="sm"
                          className="me-2"
                          onClick={() => setState(prev => ({
                            ...prev,
                            editingDriver: driver,
                            modalVisible: true
                          }))}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton
                          color="danger"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteConfirmation(driver._id)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                    <CTableRow>
                      <CTableDataCell colSpan={6} className="p-0">
                        <CCollapse visible={expandedDriver === driver._id}>
                          <div className="p-3 bg-light">
                            <CRow>
                              <CCol md={3}>
                                <strong>Date of Birth:</strong> 
                                <div>{driver.dateOfBirth}</div>
                              </CCol>
                              <CCol md={3}>
                                <strong>Hire Date:</strong> 
                                <div>{driver.hireDate}</div>
                              </CCol>
                              <CCol md={3}>
                                <strong>Driving Score:</strong> 
                                <div>{driver.drivingScore}/100</div>
                              </CCol>
                              <CCol md={3}>
                                <strong>License Expiry:</strong> 
                                <div>{driver.licenseExpiry || 'N/A'}</div>
                              </CCol>
                              <CCol md={12} className="mt-3">
                                {driver.profilePicture && (
                                  <CImage 
                                    src={driver.profilePicture} 
                                    fluid 
                                    className="img-thumbnail"
                                    style={{ maxWidth: '200px' }}
                                  />
                                )}
                              </CCol>
                            </CRow>
                          </div>
                        </CCollapse>
                      </CTableDataCell>
                    </CTableRow>
                  </React.Fragment>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>

        {/* Driver Form Modal */}
        <CModal 
          visible={state.modalVisible} 
          onClose={() => setState(prev => ({ ...prev, modalVisible: false }))}
          size="lg"
        >
          <CModalHeader closeButton>
            <CModalTitle>
              {state.editingDriver ? 'Edit Driver' : 'New Driver'}
            </CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm onSubmit={handleSubmit}>
              <CRow className="g-3">
                <CCol md={6}>
                  <CFormInput
                    label="First Name"
                    name="firstName"
                    value={state.formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    label="Last Name"
                    name="lastName"
                    value={state.formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    label="License Number"
                    name="licenseNumber"
                    value={state.formData.licenseNumber}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={state.formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    label="Email"
                    name="email"
                    type="email"
                    value={state.formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={state.formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    label="Driving Score"
                    name="drivingScore"
                    type="number"
                    min="0"
                    max="100"
                    value={state.formData.drivingScore}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    label="Hire Date"
                    name="hireDate"
                    type="date"
                    value={state.formData.hireDate}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CInputGroup>
                    <CFormLabel>Profile Picture</CFormLabel>
                    {state.formData.profilePicture && (
                      <CImage 
                        thumbnail 
                        src={
                          typeof state.formData.profilePicture === 'string' 
                            ? state.formData.profilePicture 
                            : URL.createObjectURL(state.formData.profilePicture)
                        } 
                        width={100} 
                        className="mb-2"
                      />
                    )}
                    <CFormInput
                      type="file"
                      accept="image/*"
                      name="profilePicture"
                      onChange={handleInputChange}
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={6} className="d-flex align-items-center">
                  <CFormCheck
                    label="Active Status"
                    name="activeStatus"
                    checked={state.formData.activeStatus}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      formData: {
                        ...prev.formData,
                        activeStatus: e.target.checked
                      }
                    }))}
                  />
                </CCol>
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
                  {state.isSubmitting && <CSpinner size="sm" className="me-2" />}
                  {state.editingDriver ? 'Update' : 'Create'}
                </CButton>
              </div>
            </CForm>
          </CModalBody>
        </CModal>

        {/* Delete Confirmation Modal */}
        <CModal 
          visible={deleteConfirmation.show} 
          onClose={() => setDeleteConfirmation({ show: false, driverId: null })}
        >
          <CModalHeader closeButton>
            <CModalTitle>Confirm Delete</CModalTitle>
          </CModalHeader>
          <CModalBody>
            Are you sure you want to delete this driver? This action cannot be undone.
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setDeleteConfirmation({ show: false, driverId: null })}>
              Cancel
            </CButton>
            <CButton color="danger" onClick={handleDelete}>
              Confirm Delete
            </CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </CRow>
  )
}

export default Drivers