import React, { useEffect, useState, useCallback } from 'react';
import { 
  CTable, CTableHead, CTableRow, 
  CTableHeaderCell, CTableBody, 
  CTableDataCell, CButton, CSpinner, CAlert 
} from '@coreui/react';

const API_URL = import.meta.env.VITE_API_URL;

const TripList = () => {
  // State management
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [driverId, setDriverId] = useState(null);

  // Retrieve driver ID from localStorage on component mount
  useEffect(() => {
    const storedDriverId = localStorage.getItem('driverId');
    console.log('Driver ID from localStorage:', storedDriverId);
    if (storedDriverId) {
      setDriverId(storedDriverId);
    } else {
      setError('No driver ID found. Please log in again.');
      setIsLoading(false);
      // Redirect to login page after setting error
      setTimeout(() => {
        window.location.href = '/login'; // Assuming your login page is at '/login'
      }, 3000); // Redirect after 3 seconds
    }
  }, []);

  // Memoized fetch function to prevent unnecessary rerenders
  const fetchTrips = useCallback(async () => {
    if (!driverId) {
      setError('Driver ID is missing');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null); 
  
    if (!trips.length) {  // Only fetch if there are no trips in state
      setIsLoading(true);
      setError(null);
  
      try {
        const token = localStorage.getItem("token");
        console.log('Token:', token); 
        if (!token) {
          throw new Error("No authentication token found");
        }
  
        const response = await fetch(`${API_URL}/trips/my-trips`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          const errorMessage = await response.text();
          console.error('Error response:', errorMessage);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const result = await response.json();
        console.log('Fetched trips:', result); 

       
        if (!result.data?.trips || !Array.isArray(result.data.trips)) {
          throw new Error("Invalid response format");
        }
        
        const tripsArray = result.data.trips;
        setTrips(tripsArray);
  
       
  
        const driverTrips = tripsArray.filter(trip => 
          trip.driver && trip.driver._id && trip.driver._id.toString() === driverId.toString()
        );
  
        setFilteredTrips(driverTrips);
      } catch (error) {
        console.error("Error fetching trips:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    }
  }, [driverId, trips.length]); // Adding trips.length to avoid redundant fetch
  

  // Enhanced trip acceptance with more comprehensive error handling
  const handleAcceptTrip = async (tripId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_URL}/trips/${tripId}/accept`, {
        method: 'PUT',
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ driverId }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || `Failed to accept trip (Status: ${response.status})`);
      }

      // Optimistic UI update
      setFilteredTrips(prev =>
        prev.map(trip =>
          trip._id === tripId
            ? { ...trip, status: 'Accepted' }
            : trip
        )
      );

      // Re-fetch to ensure full data consistency
      fetchTrips();
    } catch (error) {
      setError(error.message || "Failed to accept trip");
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <CSpinner color="primary" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <CAlert color="danger">
        {error}
        <CButton color="link" onClick={() => fetchTrips()}>
          Retry
        </CButton>
      </CAlert>
    );
  }
  return (
    <CTable striped hover responsive>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>Vehicle</CTableHeaderCell>
          <CTableHeaderCell>Start Location</CTableHeaderCell>
          <CTableHeaderCell>End Location</CTableHeaderCell>
          <CTableHeaderCell>Status</CTableHeaderCell>
          <CTableHeaderCell>Actions</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {filteredTrips.length > 0 ? (
          filteredTrips.map(trip => (
            <CTableRow key={trip._id}>
              <CTableDataCell>
                {trip.vehicle?.registrationNumber || "Unassigned Vehicle"}
              </CTableDataCell>
              <CTableDataCell>{trip.startLocation}</CTableDataCell>
              <CTableDataCell>{trip.endLocation}</CTableDataCell>
              <CTableDataCell>{trip.status}</CTableDataCell>
              <CTableDataCell>
                {trip.status === 'Pending' && (
                  <CButton 
                    color="success" 
                    size="sm" 
                    onClick={() => handleAcceptTrip(trip._id)}
                    className="me-2"
                  >
                    Accept Trip
                  </CButton>
                )}
                <CButton color="info" size="sm">
                  View Details
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))
        ) : (
          <CTableRow>
            <CTableDataCell colSpan={5} className="text-center">
              No assigned trips found.
            </CTableDataCell>
          </CTableRow>
        )}
      </CTableBody>
    </CTable>
  );
};

export default TripList;