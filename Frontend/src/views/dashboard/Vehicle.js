import React, { useState, useEffect, useRef } from 'react'
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
  CPagination,
  CPaginationItem,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CAlert,
  CBadge,
  CCollapse,
  CImage
} from '@coreui/react'
import VehicleForm from './vehicleForms'
import { cilPlus, cilPencil, cilTrash, cilChevronBottom, cilChevronTop } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const API_URL = import.meta.env.VITE_API_URL

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [visibleModal, setVisibleModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, vehicleId: null })
  const [expandedVehicle, setExpandedVehicle] = useState(null)
  const isMounted = useRef(true)

  const fetchVehicles = async (page = 1, limit = 10) => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/vehicles/?page=${page}&limit=${limit}`)
      if (isMounted.current) {
        setVehicles(response.data.data.vehicles)
        setTotalPages(Math.ceil(response.data.total / limit))
        setError('')
      }
    } catch (err) {
      setError(`Failed to fetch vehicles: ${err.response?.data?.message || err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    isMounted.current = true
    fetchVehicles(currentPage)
    return () => { isMounted.current = false }
  }, [currentPage])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const toggleVehicleDetails = (vehicleId) => {
    setExpandedVehicle(prev => prev === vehicleId ? null : vehicleId)
  }

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedVehicle) {
        await axios.put(`${API_URL}/vehicles/${selectedVehicle._id}`, formData)
        setSuccess('Vehicle updated successfully!')
      } else {
        await axios.post(`${API_URL}/vehicles/`, formData)
        setSuccess('Vehicle created successfully!')
      }
      setVisibleModal(false)
      await fetchVehicles(currentPage)
    } catch (err) {
      setError(`Failed to save vehicle: ${err.response?.data?.message || err.message}`)
    }
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/vehicles/${deleteConfirmation.vehicleId}`)
      setSuccess('Vehicle deleted successfully!')
      fetchVehicles(currentPage)
    } catch (err) {
      setError(`Failed to delete vehicle: ${err.response?.data?.message || err.message}`)
    } finally {
      setDeleteConfirmation({ show: false, vehicleId: null })
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Vehicle Management</h5>
            <CButton 
              color="primary" 
              onClick={() => {
                setSelectedVehicle(null)
                setVisibleModal(true)
              }}
            >
              <CIcon icon={cilPlus} className="me-2" />
              Add New Vehicle
            </CButton>
          </CCardHeader>
          
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            {success && <CAlert color="success">{success}</CAlert>}

            {loading ? (
              <div className="text-center">
                <CSpinner color="primary" />
              </div>
            ) : (
              <>
                <CTable hover responsive>
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell style={{ width: '40px' }}></CTableHeaderCell>
                      <CTableHeaderCell>Registration</CTableHeaderCell>
                      <CTableHeaderCell>Make</CTableHeaderCell>
                      <CTableHeaderCell>Type</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {vehicles.map((vehicle) => (
                      <React.Fragment key={vehicle._id}>
                        <CTableRow>
                          <CTableDataCell>
                            <CButton 
                              color="link"
                              onClick={() => toggleVehicleDetails(vehicle._id)}
                            >
                              <CIcon 
                                icon={expandedVehicle === vehicle._id ? cilChevronTop : cilChevronBottom} 
                              />
                            </CButton>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div className="d-flex align-items-center">
                              {vehicle.image && (
                                <CImage 
                                  thumbnail 
                                  src={vehicle.image} 
                                  width={50} 
                                  className="me-3"
                                />
                              )}
                              <div>
                                {vehicle.registrationNumber}
                                <div className="small text-muted">{vehicle.model}</div>
                              </div>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>{vehicle.make}</CTableDataCell>
                          <CTableDataCell>{vehicle.vehicleType}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={vehicle.operationalStatus === 'active' ? 'success' : 'danger'}>
                              {vehicle.operationalStatus}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CButton 
                              color="primary" 
                              variant="outline" 
                              size="sm" 
                              className="me-2"
                              onClick={() => {
                                setSelectedVehicle(vehicle)
                                setVisibleModal(true)
                              }}
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton 
                              color="danger" 
                              variant="outline" 
                              size="sm"
                              onClick={() => setDeleteConfirmation({ show: true, vehicleId: vehicle._id })}
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                        <CTableRow>
                          <CTableDataCell colSpan={6} className="p-0">
                            <CCollapse visible={expandedVehicle === vehicle._id}>
                              <div className="p-3 bg-light">
                                <CRow>
                                  <CCol md={3}>
                                    <strong>Year:</strong> 
                                    <div>{vehicle.year}</div>
                                  </CCol>
                                  <CCol md={3}>
                                    <strong>Mileage:</strong> 
                                    <div>{vehicle.mileage}</div>
                                  </CCol>
                                  <CCol md={3}>
                                    <strong>Capacity:</strong> 
                                    <div>{vehicle.capacity}</div>
                                  </CCol>
                                  <CCol md={3}>
                                    <strong>Last Service:</strong> 
                                    <div>{vehicle.lastServiceDate || 'N/A'}</div>
                                  </CCol>
                                  <CCol md={12} className="mt-3">
                                    {vehicle.image && (
                                      <CImage 
                                        src={vehicle.image} 
                                        fluid 
                                        className="img-thumbnail"
                                        style={{ maxWidth: '300px' }}
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

                <CPagination className="mt-3" aria-label="Page navigation">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <CPaginationItem
                      key={i + 1}
                      active={i + 1 === currentPage}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </CPaginationItem>
                  ))}
                </CPagination>
              </>
            )}
          </CCardBody>
        </CCard>

        {/* Vehicle Form Modal */}
        <CModal visible={visibleModal} onClose={() => setVisibleModal(false)} size="xl">
          <CModalHeader closeButton>
            <CModalTitle>{selectedVehicle ? 'Edit Vehicle' : 'New Vehicle'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <VehicleForm
              vehicle={selectedVehicle}
              onSubmit={handleFormSubmit}
              onCancel={() => setVisibleModal(false)}
            />
          </CModalBody>
        </CModal>

        {/* Delete Confirmation Modal */}
        <CModal visible={deleteConfirmation.show} onClose={() => setDeleteConfirmation({ show: false, vehicleId: null })}>
          <CModalHeader closeButton>
            <CModalTitle>Confirm Delete</CModalTitle>
          </CModalHeader>
          <CModalBody>
            Are you sure you want to delete this vehicle? This action cannot be undone.
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setDeleteConfirmation({ show: false, vehicleId: null })}>
              Cancel
            </CButton>
            <CButton color="danger" onClick={handleDelete}>
              Delete Vehicle
            </CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </CRow>
  )
}

export default Vehicles