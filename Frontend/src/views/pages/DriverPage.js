import { useState } from 'react';
import {
  CContainer,
  CCard,
  CCardBody,
  CCardHeader,
  CTabs,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CAlert
} from '@coreui/react';
import TripList from '../driver/TripList';
import IssueReportForm from '..//driver/IssueReportForm';
import DriverProfile from '../driver/DriverProfile';

const DriverPage = () => {
  const [activeTab, setActiveTab] = useState('trips'); // Default tab
  const [alert, setAlert] = useState({ visible: false, message: '', color: '' });

  // Sample data (replace with API calls)
  const trips = [
    {
      id: 1,
      vehicle: 'KAA 123A',
      startLocation: 'Nairobi',
      endLocation: 'Mombasa',
      status: 'In Progress'
    },
    {
      id: 2,
      vehicle: 'KBB 456B',
      startLocation: 'Kisumu',
      endLocation: 'Nakuru',
      status: 'Pending'
    }
  ];

  const showAlert = (message, color) => {
    setAlert({ visible: true, message, color });
    setTimeout(() => setAlert({ ...alert, visible: false }), 5000);
  };

  return (
    <CContainer>
      <CCard>
        <CCardHeader>
          <h2>Driver Dashboard</h2>
        </CCardHeader>
        <CCardBody>
          {alert.visible && (
            <CAlert color={alert.color} dismissible onClose={() => setAlert({ ...alert, visible: false })}>
              {alert.message}
            </CAlert>
          )}

          {/* Tab Navigation */}
          <CTabs activeTab={activeTab} onActiveTabChange={(idx) => setActiveTab(idx)}>
            <CNav variant="tabs">
              <CNavItem>
                <CNavLink>My Trips</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink>Report Issue</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink>Profile</CNavLink>
              </CNavItem>
            </CNav>

            {/* Tab Content */}
            <CTabContent>
              <CTabPane>
                {/* Trip List Component */}
                <TripList trips={trips} onSelectTrip={(trip) => console.log('Selected Trip:', trip)} />
              </CTabPane>
              <CTabPane>
                {/* Issue Report Form */}
                <IssueReportForm onSubmit={(data) => showAlert('Issue reported successfully!', 'success')} />
              </CTabPane>
              <CTabPane>
                {/* Driver Profile Component */}
                <DriverProfile onSubmit={(data) => showAlert('Profile updated successfully!', 'success')} />
              </CTabPane>
            </CTabContent>
          </CTabs>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default DriverPage;