import { useEffect, useState } from 'react';
import { CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CButton } from '@coreui/react';

const TripList = () => {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/trips/assigned')
      .then(response => response.json())
      .then(data => setTrips(data))
      .catch(error => console.error('Error fetching trips:', error));
  }, []);

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
        {trips.length > 0 ? (
          trips.map(trip => (
            <CTableRow key={trip.id}>
              <CTableDataCell>{trip.vehicle}</CTableDataCell>
              <CTableDataCell>{trip.startLocation}</CTableDataCell>
              <CTableDataCell>{trip.endLocation}</CTableDataCell>
              <CTableDataCell>{trip.status}</CTableDataCell>
              <CTableDataCell>
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
