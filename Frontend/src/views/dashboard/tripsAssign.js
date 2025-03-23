import { useEffect, useState } from "react";
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
import { cilPencil, cilTrash } from '@coreui/icons';
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// AssignTripModal Component
const AssignTripModal = ({ visible, onClose, onSubmit, formData, handleChange, drivers, vehicles, isLoading }) => (
  <CModal visible={visible} onClose={onClose}>
    <CModalHeader onClose={onClose}>
      <CModalTitle>Assign New Trip</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm onSubmit={onSubmit}>
        <div className="mb-3">
          <CFormSelect
            name="driver"
            value={formData.driver}
            onChange={handleChange}
            required
            disabled={isLoading}
          >
            <option value="">Select Driver</option>
            {isLoading ? (
              <option disabled>Loading drivers...</option>
            ) : (
              drivers.map((driver) => (
                <option key={driver._id} value={driver._id}>
                  {`${driver.firstName} ${driver.lastName}`}
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
          />
        </div>

        <div className="mb-3">
          <CFormInput
            type="datetime-local"
            name="scheduledDate"
            value={formData.scheduledDate}
            onChange={handleChange}
            required
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
const EditTripModal = ({ visible, onClose, onSubmit, formData, handleChange, drivers, vehicles }) => (
  <CModal visible={visible} onClose={onClose}>
    <CModalHeader onClose={onClose}>
      <CModalTitle>Edit Trip</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm onSubmit={onSubmit}>
        <div className="mb-3">
          <CFormSelect
            name="driver"
            value={formData.driver}
            onChange={handleChange}
            required
          >
            <option value="">Select Driver</option>
            {drivers.map((driver) => (
              <option key={driver._id} value={driver._id}>
                {`${driver.firstName} ${driver.lastName}`}
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
          />
        </div>

        <div className="mb-3">
          <CFormInput
            type="datetime-local"
            name="scheduledDate"
            value={formData.scheduledDate}
            onChange={handleChange}
            required
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
    driver: "",
    vehicle: "",
    startLocation: "",
    endLocation: "",
    scheduledDate: "",
  });
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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
    
      try {
        const token = localStorage.getItem('token');
        const [tripsRes, driversRes, vehiclesRes] = await Promise.all([
          axios.get(`${API_URL}/trips?page=${currentPage}&limit=${itemsPerPage}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/drivers/all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/vehicles`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);
        console.log("Trips Data:", tripsRes.data);
        setTrips(tripsRes.data.data.trips || []);
        setTotalTrips(tripsRes.data.data.totalTrips || 0);
        setDrivers(driversRes.data.data.drivers || []);
        setVehicles(vehiclesRes.data.data.vehicles || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        showAlert(`Error fetching data: ${error.message}`, 'danger');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  const showAlert = (message, color) => {
    setAlert({ visible: true, message, color });
    setTimeout(() => setAlert({ ...alert, visible: false }), 5000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (trip) => {
    setSelectedTrip(trip);
    setFormData({
      driver: trip.driver?._id,
      vehicle: trip.vehicle?._id,
      startLocation: trip.startLocation,
      endLocation: trip.endLocation,
      scheduledDate: new Date(trip.scheduledDate).toISOString().slice(0, 16),
    });
    setShowEditModal(true);
  };

  const handleSaveTrip = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      let response;

      if (selectedTrip) {
        response = await axios.patch(
          `${API_URL}/trips/${selectedTrip._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        showAlert('Trip updated successfully!', 'success');
      } else {
        response = await axios.post(
          `${API_URL}/trips`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        showAlert('Trip assigned successfully!', 'success');
      }

      setTrips(trips => selectedTrip ? 
        trips.map(t => t._id === selectedTrip._id ? response.data.data.trip : t) :
        [...trips, response.data.data.trip]
      );

      setFormData({
        driver: "",
        vehicle: "",
        startLocation: "",
        endLocation: "",
        scheduledDate: "",
      });
      setSelectedTrip(null);
      setVisibleModal(false);
      setShowEditModal(false);
    } catch (error) {
      console.error('Save Error:', error);
      if (error.response?.data?.message) {
        showAlert(`Error: ${error.response.data.message}`, 'danger');
      } else if (error.response?.status === 500) {
        showAlert('Server error. Please try again later.', 'danger');
      } else {
        showAlert('An unexpected error occurred.', 'danger');
      }
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/trips/${tripToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrips(trips.filter(trip => trip._id !== tripToDelete));
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
        <CCardHeader>
          <h2 className="h5 mb-0">Fleet Manager - Trips</h2>
          <CButton 
            color="primary" 
            onClick={() => setVisibleModal(true)}
            className="float-end"
          >
            Assign Trip
          </CButton>
        </CCardHeader>
        <CCardBody>
          {alert.visible && (
            <CAlert color={alert.color} dismissible onClose={() => setAlert({ ...alert, visible: false })}>
              {alert.message}
            </CAlert>
          )}

          <AssignTripModal
            visible={visibleModal}
            onClose={() => setVisibleModal(false)}
            onSubmit={handleSaveTrip}
            formData={formData}
            handleChange={handleChange}
            drivers={drivers}
            vehicles={vehicles}
            isLoading={isLoading}
          />

          <EditTripModal
            visible={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedTrip(null);
            }}
            onSubmit={handleSaveTrip}
            formData={formData}
            handleChange={handleChange}
            drivers={drivers}
            vehicles={vehicles}
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
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {trips.map((trip) => (
                    <CTableRow key={trip._id}>
                      <CTableDataCell>{trip.driver?`${trip.driver.firstName || ''} ${trip.driver.lastName || 'N/A'}` : 'No Driver Assigned'}</CTableDataCell>
                      <CTableDataCell>{trip.vehicle?.registrationNumber || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{trip.startLocation}</CTableDataCell>
                      <CTableDataCell>{trip.endLocation}</CTableDataCell>
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