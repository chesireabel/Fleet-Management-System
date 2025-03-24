import { useEffect, useState } from 'react';
import { CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CButton } from '@coreui/react';

const TripList = ({ driverId }) => {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/trips')
      .then(response => response.json())
      .then(data => {
        setTrips(data);
        // Filter trips for the logged-in driver
        const driverTrips = data.filter(trip => trip.driverId === driverId);
        setFilteredTrips(driverTrips);
      })
      .catch(error => console.error('Error fetching trips:', error));
  }, [driverId]);

  const handleAcceptTrip = async (tripId) => {
    try {
      const response = await fetch(`http://localhost:5000/trips/${tripId}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driverId }),
      });
      if (response.ok) {
        // Refresh trips after accepting
        setFilteredTrips(filteredTrips.map(trip => 
          trip.id === tripId ? { ...trip, status: 'Accepted', driverId } : trip
        ));
      }
    } catch (error) {
      console.error('Error accepting trip:', error);
    }
  };

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
            <CTableRow key={trip.id}>
              <CTableDataCell>{trip.vehicle}</CTableDataCell>
              <CTableDataCell>{trip.startLocation}</CTableDataCell>
              <CTableDataCell>{trip.endLocation}</CTableDataCell>
              <CTableDataCell>{trip.status}</CTableDataCell>
              <CTableDataCell>
                {trip.status === 'Pending' && (
                  <CButton 
                    color="success" 
                    size="sm" 
                    onClick={() => handleAcceptTrip(trip.id)}
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
            <CTableDataCell colSpan="5" className="text-center">
              No assigned trips found.
            </CTableDataCell>
          </CTableRow>
        )}
      </CTableBody>
    </CTable>
  );
};

export default TripList;
