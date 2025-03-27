import React, { useEffect, useState, useCallback } from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormSelect,
  CFormInput,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CContainer,
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CPagination,
  CPaginationItem,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash, cilFilter } from '@coreui/icons';
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Utility function for form validation
const validateTripForm = (formData) => {
  const errors = {};
  
  if (!formData.user) errors.user = "User(Driver) is required";
  if (!formData.vehicle) errors.vehicle = "Vehicle is required";
  if (!formData.startLocation.trim()) errors.startLocation = "Start location is required";
  if (!formData.endLocation.trim()) errors.endLocation = "End location is required";
  if (!formData.scheduledDate) errors.scheduledDate = "Scheduled date is required";

  // Validate scheduled date is in the future
  const scheduledDate = new Date(formData.scheduledDate);
  if (scheduledDate <= new Date()) {
    errors.scheduledDate = "Scheduled date must be in the future";
  }

  return errors;
};

// AssignTripModal Component
const AssignTripModal = ({ 
  visible, 
  onClose, 
  onSubmit, 
  formData, 
  handleChange, 
  drivers, 
  vehicles, 
  isLoading,
  formErrors 
}) => (
  <CModal visible={visible} onClose={onClose}>
    <CModalHeader onClose={onClose}>
      <CModalTitle>Assign New Trip</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm onSubmit={onSubmit}>
        <div className="mb-3">
          <CFormSelect
            name="user"
            value={formData.user}
            onChange={handleChange}
            required
            disabled={isLoading}
            invalid={!!formErrors.user}
            feedback={formErrors.user}
          >
            <option value="">Select Driver</option>
            {isLoading ? (
              <option disabled>Loading drivers...</option>
            ) : (
              drivers.map((driver) => (
               <option key={driver._id} value={driver.user?._id}>
                    {`${driver.user?.firstName} ${driver.user?.lastName}`}
                </option>
              ))
            )}
          </CFormSelect>
        </div>

        <div className="mb-3">
          <CFormSelect
            name="vehicle"
            value={formData.vehicle}
            onChange={handleChange}
            required
            disabled={isLoading}
            invalid={!!formErrors.vehicle}
            feedback={formErrors.vehicle}
          >
            <option value="">Select Vehicle</option>
            {isLoading ? (
              <option disabled>Loading vehicles...</option>
            ) : (
              vehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.registrationNumber}
                </option>
              ))
            )}
          </CFormSelect>
        </div>

        <div className="mb-3">
          <CFormInput
            type="text"
            name="startLocation"
            placeholder="Start Location"
            value={formData.startLocation}
            onChange={handleChange}
            required
            invalid={!!formErrors.startLocation}
            feedback={formErrors.startLocation}
          />
        </div>

        <div className="mb-3">
          <CFormInput
            type="text"
            name="endLocation"
            placeholder="End Location"
            value={formData.endLocation}
            onChange={handleChange}
            required
            invalid={!!formErrors.endLocation}
            feedback={formErrors.endLocation}
          />
        </div>

        <div className="mb-3">
          <CFormInput
            type="datetime-local"
            name="scheduledDate"
            value={formData.scheduledDate}
            onChange={handleChange}
            required
            invalid={!!formErrors.scheduledDate}
            feedback={formErrors.scheduledDate}
          />
        </div>

        <CModalFooter>
          <CButton color="secondary" onClick={onClose}>
            Cancel
          </CButton>
          <CButton type="submit" color="primary" disabled={isLoading}>
            Assign Trip
          </CButton>
        </CModalFooter>
      </CForm>
    </CModalBody>
  </CModal>
);

// EditTripModal Component
const EditTripModal = ({ 
  visible, 
  onClose, 
  onSubmit, 
  formData, 
  handleChange, 
  drivers, 
  vehicles,
  formErrors 
}) => (
  <CModal visible={visible} onClose={onClose}>
    <CModalHeader onClose={onClose}>
      <CModalTitle>Edit Trip</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm onSubmit={onSubmit}>
        <div className="mb-3">
          <CFormSelect
            name="user"
            value={formData.user}
            onChange={handleChange}
            required
            invalid={!!formErrors.user}
            feedback={formErrors.user}
          >
            <option value="">Select Driver</option>
            {drivers.map((driver) => (
              <option key={driver._id} value={driver.user?._id}>
                {`${driver.user?.firstName} ${driver.user?.lastName}`}
              </option>
            ))}
          </CFormSelect>
        </div>

        <div className="mb-3">
          <CFormSelect
            name="vehicle"
            value={formData.vehicle}
            onChange={handleChange}
            required
            invalid={!!formErrors.vehicle}
            feedback={formErrors.vehicle}
          >
            <option value="">Select Vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.registrationNumber}
              </option>
            ))}
          </CFormSelect>
        </div>

        <div className="mb-3">
          <CFormInput
            type="text"
            name="startLocation"
            placeholder="Start Location"
            value={formData.startLocation}
            onChange={handleChange}
            required
            invalid={!!formErrors.startLocation}
            feedback={formErrors.startLocation}
          />
        </div>

        <div className="mb-3">
          <CFormInput
            type="text"
            name="endLocation"
            placeholder="End Location"
            value={formData.endLocation}
            onChange={handleChange}
            required
            invalid={!!formErrors.endLocation}
            feedback={formErrors.endLocation}
          />
        </div>

        <div className="mb-3">
          <CFormInput
            type="datetime-local"
            name="scheduledDate"
            value={formData.scheduledDate}
            onChange={handleChange}
            required
            invalid={!!formErrors.scheduledDate}
            feedback={formErrors.scheduledDate}
          />
        </div>

        <CModalFooter>
          <CButton color="secondary" onClick={onClose}>
            Cancel
          </CButton>
          <CButton type="submit" color="primary">
            Save Changes
          </CButton>
        </CModalFooter>
      </CForm>
    </CModalBody>
  </CModal>
);

// DeleteConfirmationModal Component
const DeleteConfirmationModal = ({ visible, onClose, onConfirm }) => (
  <CModal visible={visible} onClose={onClose}>
    <CModalHeader>Confirm Delete</CModalHeader>
    <CModalBody>
      Are you sure you want to delete this trip?
    </CModalBody>
    <CModalFooter>
      <CButton color="danger" onClick={onConfirm}>Delete</CButton>
      <CButton color="secondary" onClick={onClose}>Cancel</CButton>
    </CModalFooter>
  </CModal>
);

// Main Trips Component
const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    user: "",
    vehicle: "",
    startLocation: "",
    endLocation: "",
    scheduledDate: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [alert, setAlert] = useState({ visible: false, message: '', color: '' });
  const [visibleModal, setVisibleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalTrips, setTotalTrips] = useState(0);
  
  // Filter states
  const [filters, setFilters] = useState({
    startLocation: '',
    endLocation: '',
   userId: '',
    vehicleId: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Show Alert Utility
  const showAlert = (message, color) => {
    setAlert({ visible: true, message, color });
    setTimeout(() => setAlert({ ...alert, visible: false }), 5000);
  };

  // Memoized fetch functions to prevent unnecessary re-renders
  const fetchDriversAndVehicles = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const [driversRes, vehiclesRes] = await Promise.all([
        axios.get(`${API_URL}/drivers/all`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/vehicles`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setDrivers(driversRes.data?.data?.drivers || driversRes.data?.drivers || []);
      setVehicles(vehiclesRes.data?.data?.vehicles || vehiclesRes.data?.vehicles || []);
    } catch (error) {
      console.error('Error fetching drivers/vehicles:', error);
      showAlert('Failed to fetch drivers and vehicles', 'danger');
    }
  }, []);

  const fetchTrips = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        startLocation: filters.startLocation,
        endLocation: filters.endLocation,
        userId: filters.userId,
        vehicleId: filters.vehicleId
      });

      const tripsRes = await axios.get(`${API_URL}/trips?${queryParams}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          withCredentials: true 
        }
      });

      setTrips(tripsRes.data?.data?.trips || []);
      setTotalTrips(tripsRes.data?.data?.totalTrips || 0);
    } catch (error) {
      console.error('Error fetching trips:', error);
      showAlert('Failed to fetch trips', 'danger');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  // Consolidated useEffect for data fetching
  useEffect(() => {
    fetchDriversAndVehicles();
    fetchTrips();
  }, [fetchDriversAndVehicles, fetchTrips]);

  // Enhanced error handling and validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(1);  // Reset to first page when applying filters
    fetchTrips();
  };

  const resetFilters = () => {
    setFilters({
      startLocation: '',
      endLocation: '',
      userId: '',
      vehicleId: ''
    });
    setCurrentPage(1);
    fetchTrips();
  };

  const handleEditClick = (trip) => {
    console.log("Selected Trip:", trip);
    setSelectedTrip(trip);
    setFormData({
      driver: trip.user?._id || "",
      vehicle: trip.vehicle?._id || "",
      startLocation: trip.startLocation || "",
      endLocation: trip.endLocation || "",
      scheduledDate: trip.scheduledDate
        ? new Date(trip.scheduledDate).toISOString().slice(0, 16)
        : "",
    });
    setShowEditModal(true);
  };

  const handleSaveTrip = async (e) => {
    e.preventDefault();
    
    


    // Validate form before submission
    const validationErrors = validateTripForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const dataToSend = {
        ...formData,
        scheduledDate: new Date(formData.scheduledDate).toISOString()
      };

      console.log('API URL:', API_URL);  // Log the API URL
      console.log('Request Data:', dataToSend);  // Log the data being sent
  

      if (selectedTrip) {
        const updateResponse = await axios.patch(
          `${API_URL}/trips/${selectedTrip._id}`,
          dataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('Update Response:', updateResponse); 
      } else {
        const createResponse = await axios.post(
          `${API_URL}/trips`,
          dataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('Create Response:', createResponse); 
      }

      // Refetch trips after successful save
      fetchTrips();
      
      showAlert(selectedTrip ? 'Trip updated!' : 'Trip assigned!', 'success');
      
      // Reset form and modals
      setFormData({
        user: "",
        vehicle: "",
        startLocation: "",
        endLocation: "",
        scheduledDate: "",
      });
      setSelectedTrip(null);
      setVisibleModal(false);
      setShowEditModal(false);
      setFormErrors({});
    } catch (error) {
      console.error('Save Error:', error);
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
      showAlert(errorMessage, 'danger');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/trips/${tripToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refetch trips after deletion
      fetchTrips();
      
      showAlert('Trip deleted successfully!', 'success');
    } catch (error) {
      console.error('Delete Error:', error);
      showAlert(error.response?.data?.message || 'Error deleting trip', 'danger');
    } finally {
      setTripToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <CContainer>
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <h2 className="h5 mb-0">Fleet Manager - Trips</h2>
          <div>
            <CButton 
              color="info" 
              variant="outline" 
              className="me-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <CIcon icon={cilFilter} /> Filters
            </CButton>
            <CButton 
              color="primary" 
              onClick={() => {
                setFormData({ driver: "", vehicle: "", startLocation: "", endLocation: "", scheduledDate: "" });  
                setVisibleModal(true);
              }}
            >
              Assign Trip
            </CButton>
          </div>
        </CCardHeader>
        
        {/* Filter Section */}
        {showFilters && (
          <div className="p-3 bg-light">
            <div className="row">
              <div className="col-md-3">
                <CFormInput 
                  placeholder="Start Location"
                  name="startLocation"
                  value={filters.startLocation}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-3">
                <CFormInput 
                  placeholder="End Location"
                  name="endLocation"
                  value={filters.endLocation}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-3">
                <CFormSelect
                  name="driverId"
                  value={filters.driverId}
                  onChange={handleFilterChange}
                >
                  <option value="">All Drivers</option>
                  {drivers.map(driver => (
                    <option key={driver._id} value={driver._id}>
                      {`${driver.user?.firstName} ${driver.user?.lastName}`}
                    </option>
                  ))}
                </CFormSelect>
              </div>
              <div className="col-md-3 d-flex">
                <CButton color="primary" className="me-2" onClick={applyFilters}>
                  Apply Filters
                </CButton>
                <CButton color="secondary" onClick={resetFilters}>
                  Reset
                </CButton>
              </div>
            </div>
          </div>
        )}

        <CCardBody>
          {alert.visible && (
            <CAlert color={alert.color} dismissible onClose={() => setAlert({ ...alert, visible: false })}>
              {alert.message}
            </CAlert>
          )}

          <AssignTripModal
            visible={visibleModal}
            onClose={() => {
              setVisibleModal(false);
              setFormData({ driver: "", vehicle: "", startLocation: "", endLocation: "", scheduledDate: "" });
              setFormErrors({});
            }}
            onSubmit={handleSaveTrip}
            formData={formData}
            handleChange={handleChange}
            drivers={drivers}
            vehicles={vehicles}
            isLoading={isLoading}
            formErrors={formErrors}
          />

          <EditTripModal
            visible={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedTrip(null);
              setFormData({ driver: "", vehicle: "", startLocation: "", endLocation: "", scheduledDate: "" });
              setFormErrors({});
            }}
            onSubmit={handleSaveTrip}
            formData={formData}
            handleChange={handleChange}
            drivers={drivers}
            vehicles={vehicles}
            formErrors={formErrors}
          />

          <DeleteConfirmationModal
            visible={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setTripToDelete(null);
            }}
            onConfirm={handleConfirmDelete}
          />

          {isLoading ? (
            <p>Loading trips...</p>
          ) : (
            <>
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Driver</CTableHeaderCell>
                    <CTableHeaderCell>Vehicle</CTableHeaderCell>
                    <CTableHeaderCell>Start Location</CTableHeaderCell>
                    <CTableHeaderCell>End Location</CTableHeaderCell>
                    <CTableHeaderCell>Scheduled Date</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {trips.map((trip) => (
                    <CTableRow key={trip._id}>
                      <CTableDataCell>
                        
                         { `${trip?.user?.firstName} ${trip?.user?.lastName}`}
                         
                      </CTableDataCell>
                      <CTableDataCell>
                        {trip.vehicle ? trip.vehicle.registrationNumber : 'N/A'}
                      </CTableDataCell>
                      <CTableDataCell>{trip.startLocation}</CTableDataCell>
                      <CTableDataCell>{trip.endLocation}</CTableDataCell>
                      <CTableDataCell>
                        {new Date(trip.scheduledDate).toLocaleString()}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          size="sm"
                          variant="ghost"
                          color="warning"
                          onClick={() => handleEditClick(trip)}
                          className="me-2"
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton
                          size="sm"
                          variant="ghost"
                          color="danger"
                          onClick={() => {
                            setTripToDelete(trip._id);
                            setShowDeleteModal(true);
                          }}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              <CPagination>
                {Array.from({ length: Math.ceil(totalTrips / itemsPerPage) }, (_, i) => (
                  <CPaginationItem
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => paginate(i + 1)}
                  >
                    {i + 1}
                  </CPaginationItem>
                ))}
              </CPagination>
            </>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default Trips;