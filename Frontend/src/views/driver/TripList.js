import { CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CButton } from '@coreui/react';

const TripList = ({ trips, onSelectTrip }) => {
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
        {trips.map(trip => (
          <CTableRow key={trip.id}>
            <CTableDataCell>{trip.vehicle}</CTableDataCell>
            <CTableDataCell>{trip.startLocation}</CTableDataCell>
            <CTableDataCell>{trip.endLocation}</CTableDataCell>
            <CTableDataCell>{trip.status}</CTableDataCell>
            <CTableDataCell>
              <CButton color="info" size="sm" onClick={() => onSelectTrip(trip)}>
                Update Details
              </CButton>
            </CTableDataCell>
          </CTableRow>
        ))}
      </CTableBody>
    </CTable>
  );
};

export default TripList;