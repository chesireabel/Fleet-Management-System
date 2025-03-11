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
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL

// AssignTripModal Component
const AssignTripModal = ({ visible, onClose, onSubmit, formData, handleChange, drivers, vehicles }) => (
  <CModal visible={visible} onClose={onClose}>
    <CModalHeader onClose={onClose}>
      <CModalTitle>Assign New Trip</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm onSubmit={onSubmit}>
        <div className="mb-3">
          <CFormSelect
            name="driverId"
            value={formData.driverId}
            onChange={handleChange}
            required
          >
            <option value="">Select Driver</option>
            {drivers.length === 0 ? (
              <option disabled>Loading drivers...</option>
            ) : (
              drivers.map((driver) => (
                <option key={driver._id} value={driver._id}>
                  {driver.name}
                </option>
              ))
            )}
          </CFormSelect>
        </div>

        <div className="mb-3">
          <CFormSelect
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            required
          >
            <option value="">Select Vehicle</option>
            {vehicles.length === 0 ? (
              <option disabled>Loading vehicles...</option>
            ) : (
              vehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.plateNumber}
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
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
          />
        </div>

        <CModalFooter>
          <CButton color="secondary" onClick={onClose}>
            Cancel
          </CButton>
          <CButton type="submit" color="primary">
            Assign Trip
          </CButton>
        </CModalFooter>
      </CForm>
    </CModalBody>
  </CModal>
);

// Main Trips Component
const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    driverId: "",
    vehicleId: "",
    startLocation: "",
    endLocation: "",
    startTime: "",
  });
  const [alert, setAlert] = useState({ visible: false, message: '', color: '' });
  const [visibleModal, setVisibleModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch Trips, Drivers, and Vehicles
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL;

        // Using axios for all requests
        const [tripsRes, driversRes, vehiclesRes] = await Promise.all([
          axios.get(`${API_URL}/trips`),
          axios.get(`${API_URL}/drivers`),
          axios.get(`${API_URL}/vehicles`)
        ]);

        // Access data through axios response.data
        const tripsData = tripsRes.data;
        const driversData = driversRes.data;
        const vehiclesData = vehiclesRes.data;

        if (!Array.isArray(tripsData)) {
          throw new Error('Invalid trips data format');
        }

        setTrips(tripsData);
        setDrivers(driversData);
        setVehicles(vehiclesData);

      } catch (error) {
        console.error('Fetch Error:', error);
        showAlert(`Error fetching data: ${error.message}`, 'danger');
        setTrips([]);
        setDrivers([]);
        setVehicles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Show Alert
  const showAlert = (message, color) => {
    setAlert({ visible: true, message, color });
    setTimeout(() => setAlert({ ...alert, visible: false }), 5000);
  };

  // Handle Form Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Assign Trip
  const handleAssignTrip = async (e) => {
    e.preventDefault();
    if (!formData.driverId || !formData.vehicleId || !formData.startLocation || !formData.endLocation || !formData.startTime) {
      showAlert('Please fill all fields', 'danger');
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL;

      const response = await axios.post(`${API_URL}/assign-trip`, formData);

      showAlert('Trip assigned successfully!', 'success');
      setTrips([...trips, response.data]);
      setFormData({
        driverId: "",
        vehicleId: "",
        startLocation: "",
        endLocation: "",
        startTime: "",
      });
      setVisibleModal(false);
    } catch (error) {
      console.error('Assignment Error:', error);
      showAlert(`Error assigning trip: ${error.response?.data?.message || error.message}`, 'danger');
    }
  };

  // Handle Update Trip Status
  const handleUpdateStatus = async (tripId, newStatus) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;

      const response = await axios.put(`${API_URL}/update-trip-status/${tripId}`, {
        status: newStatus
      });

      setTrips(trips.map(trip => 
        trip._id === response.data._id ? response.data : trip
      ));
      showAlert('Trip status updated successfully!', 'success');
    } catch (error) {
      console.error('Update Error:', error);
      showAlert(`Error updating status: ${error.response?.data?.message || error.message}`, 'danger');
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTrips = trips.slice(indexOfFirstItem, indexOfLastItem);

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
            onSubmit={handleAssignTrip}
            formData={formData}
            handleChange={handleChange}
            drivers={drivers}
            vehicles={vehicles}
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
                    <CTableHeaderCell>Status</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {currentTrips.map((trip) => (
                    <CTableRow key={trip._id}>
                      <CTableDataCell>{trip.driver?.name || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{trip.vehicle?.plateNumber || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{trip.startLocation}</CTableDataCell>
                      <CTableDataCell>{trip.endLocation}</CTableDataCell>
                      <CTableDataCell>
                        <CFormSelect
                          value={trip.tripStatus}
                          onChange={(e) => handleUpdateStatus(trip._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Canceled">Canceled</option>
                        </CFormSelect>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              <CPagination>
                {Array.from({ length: Math.ceil(trips.length / itemsPerPage) }, (_, i) => (
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