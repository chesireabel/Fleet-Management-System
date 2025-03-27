import axios from "axios";
import React, { useEffect, useState, useCallback } from 'react';
import { 
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody,CRow,CCol,CCard, CTableDataCell, CButton, CSpinner,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CForm, CFormInput, CFormLabel,CCardHeader,CCardBody, CTooltip 
} from '@coreui/react';
import { cilWarning, cilReload, cilLockLocked, cilWifiSignalOff } from '@coreui/icons';
import CIcon from '@coreui/icons-react';


const API_URL = import.meta.env.VITE_API_URL;

// Axios configuration
axios.defaults.baseURL = API_URL;
axios.defaults.timeout = 10000;
axios.defaults.headers.common['Content-Type'] = 'application/json';

axios.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const ErrorType = {
  NETWORK: 'network',
  SERVER: 'server',
  AUTH: 'auth',
  CONFLICT: 'conflict',
  DEFAULT: 'default'
};

const getErrorConfig = (type) => {
  const errorMap = {
    [ErrorType.NETWORK]: {
      icon: cilWifiSignalOff,
      title: 'Connection Issue',
      message: "We can't connect to our services",
      instructions: [
        'Check your internet connection',
        'Try refreshing the page',
        'Contact support if problem persists'
      ],
      actionText: 'Retry Connection',
      color: 'warning',
      action: () => window.location.reload()
    },
    [ErrorType.AUTH]: {
      icon: cilLockLocked,
      title: 'Session Expired',
      message: 'Authentication required',
      instructions: ['Your session has timed out', 'Please log in again'],
      actionText: 'Go to Login',
      color: 'danger',
      action: () => window.location.href = '/login'
    },
    [ErrorType.CONFLICT]: {
      icon: cilWarning,
      title: 'Trips Conflict',
      message: 'Cannot complete this action',
      instructions: [
        'Another driver accepted these trips',
        'The trips may have been canceled',
        'Refresh for latest status'
      ],
      actionText: 'Refresh Trips',
      color: 'info',
      action: null
    },
    [ErrorType.SERVER]: {
      icon: cilWarning,
      title: 'Service Issue',
      message: 'Temporary service disruption',
      instructions: [
        'Our team has been notified',
        'Try again in a few minutes',
        'Check status page for updates'
      ],
      actionText: 'Try Again',
      color: 'danger',
      action: () => window.location.reload()
    },
    [ErrorType.DEFAULT]: {
      icon: cilWarning,
      title: 'Unexpected Error',
      message: 'Something went wrong',
      instructions: [
        'Try refreshing the page',
        'Contact support for assistance'
      ],
      actionText: 'Refresh Page',
      color: 'secondary',
      action: () => window.location.reload()
    }
  };
  return errorMap[type] || errorMap[ErrorType.DEFAULT];
};

const ErrorDisplay = ({ errorConfig, onRetry }) => {
  const resolvedConfig = {
    ...errorConfig,
    action: errorConfig.action || onRetry
  };

  return (
    <CRow className="justify-content-center mt-5">
      <CCol md="8">
        <CCard className="shadow">
          <CCardHeader className={`bg-${resolvedConfig.color} text-white`}>
            <CIcon icon={resolvedConfig.icon} className="me-2" />
            {resolvedConfig.title}
          </CCardHeader>
          <CCardBody>
            <div className="text-center mb-4">
              <h4>{resolvedConfig.message}</h4>
            </div>
            <ul className="list-unstyled mb-4">
              {resolvedConfig.instructions.map((instruction, index) => (
                <li key={index} className="mb-2">
                  <CIcon icon={cilWarning} className="text-warning me-2" />
                  {instruction}
                </li>
              ))}
            </ul>
            <div className="text-center">
              {resolvedConfig.action && (
                <CButton
                  color={resolvedConfig.color}
                  onClick={resolvedConfig.action}
                  className="me-3"
                >
                  <CIcon icon={cilReload} className="me-2" />
                  {resolvedConfig.actionText}
                </CButton>
              )}
              <CButton
                color="light"
                href="mailto:support@rideapp.com"
                variant="outline"
              >
                Contact Support
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

const CompleteTripModal = ({ isOpen, toggleModal, tripsData, onComplete }) => {
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    distanceTraveled: '',
    fuelConsumption: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (tripsData) {
      setFormData({
        startTime: tripsData.startTime || '',
        endTime: tripsData.endTime || '',
        distanceTraveled: tripsData.distanceTraveled || '',
        fuelConsumption: tripsData.fuelConsumption || ''
      });
    }
  }, [tripsData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (!formData.distanceTraveled || formData.distanceTraveled <= 0) 
      newErrors.distanceTraveled = 'Valid distance is required';
    if (!formData.fuelConsumption || formData.fuelConsumption <= 0) 
      newErrors.fuelConsumption = 'Valid fuel consumption is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onComplete({
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        distanceTraveled: parseFloat(formData.distanceTraveled),
        fuelConsumption: parseFloat(formData.fuelConsumption)
      });
      toggleModal();
    } catch (error) {
      console.error('Completion failed:', error);
    }
  };

  return (
    <CModal visible={isOpen} onClose={toggleModal} alignment="center">
      <CModalHeader closeButton>
        <CModalTitle>Complete Trip Details</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm onSubmit={handleSubmit}>
          <div className="mb-3">
            <CFormLabel>Start Time</CFormLabel>
            <CFormInput
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              invalid={!!errors.startTime}
            />
            {errors.startTime && (
              <div className="text-danger small mt-1">{errors.startTime}</div>
            )}
          </div>

          <div className="mb-3">
            <CFormLabel>End Time</CFormLabel>
            <CFormInput
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              invalid={!!errors.endTime}
            />
            {errors.endTime && (
              <div className="text-danger small mt-1">{errors.endTime}</div>
            )}
          </div>

          <div className="mb-3">
            <CFormLabel>Distance Traveled (km)</CFormLabel>
            <CFormInput
              type="number"
              min="0"
              step="0.1"
              name="distanceTraveled"
              value={formData.distanceTraveled}
              onChange={handleChange}
              invalid={!!errors.distanceTraveled}
            />
            {errors.distanceTraveled && (
              <div className="text-danger small mt-1">{errors.distanceTraveled}</div>
            )}
          </div>

          <div className="mb-3">
            <CFormLabel>Fuel Consumption (liters)</CFormLabel>
            <CFormInput
              type="number"
              min="0"
              step="0.1"
              name="fuelConsumption"
              value={formData.fuelConsumption}
              onChange={handleChange}
              invalid={!!errors.fuelConsumption}
            />
            {errors.fuelConsumption && (
              <div className="text-danger small mt-1">{errors.fuelConsumption}</div>
            )}
          </div>

          <CModalFooter>
            <CButton color="secondary" onClick={toggleModal}>
              Cancel
            </CButton>
            <CButton color="primary" type="submit">
              Submit Completion
            </CButton>
          </CModalFooter>
        </CForm>
      </CModalBody>
    </CModal>
  );
};

const TripsList = () => {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [driverId] = useState(localStorage.getItem('driverId'));
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleError = useCallback((error) => {
    console.error('Trips Error:', error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return;
    }

    setError(getErrorConfig(
      error.response?.status === 409 ? ErrorType.CONFLICT :
      error.code === 'ECONNABORTED' ? ErrorType.NETWORK :
      ErrorType.SERVER
    ));
    setIsLoading(false);
  }, []);

  const fetchTrips = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/trips/driver/trips');
      setTrips(response.data?.data?.trips || []);
      setFilteredTrips(response.data?.data?.trips || []);
      setError(null);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleAcceptTrips = async (tripsId) => {
    const originalTrips = [...filteredTrips];
    
    try {
      setFilteredTrips(prev => 
        prev.map(t => t._id === tripsId ? { ...t, status: 'Accepted' } : t)
      );
      await axios.put(`/trips/${tripsId}/accept`, { driverId });
      await fetchTrips();
    } catch (error) {
      setFilteredTrips(originalTrips);
      error.response?.status === 409 
        ? handleError(error, ErrorType.CONFLICT)
        : handleError(error);
    }
  };


  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const handleCompleteTrip = async (tripId, formData) => {
    const originalTrips = [...filteredTrips];
    try {
      setFilteredTrips(prev => 
        prev.map(t => t._id === tripId ? { ...t, status: 'Completed' } : t)
      );
      await axios.put(`/trips/${tripId}/complete`, formData);
      await fetchTrips();
    } catch (error) {
      setFilteredTrips(originalTrips);
      handleError(error);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <CSpinner color="primary" />
        <span className="ms-3">Loading available trips...</span>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay errorConfig={error} onRetry={fetchTrips} />;
  }


  
  return (
    <>
      <CTable striped hover responsive className="mt-4">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Vehicle</CTableHeaderCell>
            <CTableHeaderCell>Start Location</CTableHeaderCell>
            <CTableHeaderCell>End Location</CTableHeaderCell>
            <CTableHeaderCell>Scheduled Date</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {filteredTrips.length > 0 ? (
            filteredTrips.map(trips => (
              <CTableRow key={trips._id}>
                <CTableDataCell>
                  {trips.vehicle?.registrationNumber || 'Unassigned'}
                </CTableDataCell>
                <CTableDataCell>{trips.startLocation}</CTableDataCell>
                <CTableDataCell>{trips.endLocation}</CTableDataCell>
                <CTableDataCell>
                  {new Date(trips.scheduledDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </CTableDataCell>
                <CTableDataCell>
                  <span className={`badge bg-${getStatusBadgeClass(trips.tripStatus)} p-2`}>
                    {trips.tripStatus}
                  </span>
                </CTableDataCell>
                <CTableDataCell>
                  <CTooltip
                   content={trips.tripStatus === 'Completed' 
                    ? "This trip has already been completed" 
                    : "Click to complete trip details"
                  }
                >

                  
                  <span>
                  <CButton 
                    color="info" 
                    size="sm" 
                    onClick={() => {
                      setSelectedTrip(trips);
                      setIsModalOpen(true);
                    }}
                    disabled={trips.tripStatus === 'Completed'}
                    title={trips.tripStatus === 'Completed' ? "This trip has already been completed" : ""}
                    className={trips.tripStatus === 'Completed' ? "opacity-75" : ""}
                  >
 {trips.tripStatus === 'Completed' ? "Completed" : "Complete Trip"}
                   </CButton>

</span>
</CTooltip>

                  
                </CTableDataCell>
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell colSpan="6" className="text-center py-5">
                <h4>No trips currently available</h4>
                <p className="text-muted">New trips will appear here when assigned</p>
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>

      <CompleteTripModal
        isOpen={isModalOpen}
        toggleModal={() => setIsModalOpen(!isModalOpen)}
        tripData={selectedTrip}
        onComplete={(formData) => {
          if (selectedTrip) {
            handleCompleteTrip(selectedTrip._id, formData);
          }
        }}
      />
    </>
  );
};

export default TripsList;