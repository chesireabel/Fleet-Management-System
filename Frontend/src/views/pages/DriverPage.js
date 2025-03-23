import React from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import {
  CContainer,
  CCard,
  CCardBody,
  CCardHeader,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CCol,
  CButton,
} from '@coreui/react';
import { CIcon } from '@coreui/icons-react';
import { cilWarning, cilUser, cilAccountLogout } from '@coreui/icons';
import TripList from '../driver/TripList';
import IssueReportForm from '../driver/IssueReportForm';
import DriverProfile from '../driver/DriverProfile';

const DriverPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your logout logic here
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  return (
    <CContainer 
      fluid 
      className="min-vh-100 p-0 d-flex flex-column" 
      style={{ backgroundColor: '#f8f9fa' }}
    >
      <CCard className="shadow-sm flex-grow-1 rounded-0">
        <CCardHeader className="bg-light py-3 border-bottom">
          <CRow className="align-items-center">
            <CCol>
              <h3 className="mb-0">🚛 Driver Dashboard</h3>
            </CCol>
            <CCol xs="auto">
              <CButton 
                color="danger" 
                variant="outline" 
                onClick={handleLogout}
                className="d-flex align-items-center"
              >
                <CIcon icon={cilAccountLogout} className="me-2" />
                Log Out
              </CButton>
            </CCol>
          </CRow>
        </CCardHeader>
        
        <CCardBody className="p-0 d-flex flex-column">
          <CNav variant="tabs" className="m-3 mb-0">
            <CNavItem>
              <CNavLink 
                as={Link} 
                to="/driver/trips" 
                className="text-dark fw-medium px-4 py-3"
                activeClassName="active bg-white border-bottom-white"
              >
                <CIcon className="me-2" />
                My Trips
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink 
                as={Link} 
                to="/driver/issues" 
                className="text-dark fw-medium px-4 py-3"
                activeClassName="active bg-white border-bottom-white"
              >
                <CIcon icon={cilWarning} className="me-2" />
                Report Issue
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink 
                as={Link} 
                to="/driver/profile" 
                className="text-dark fw-medium px-4 py-3"
                activeClassName="active bg-white border-bottom-white"
              >
                <CIcon icon={cilUser} className="me-2" />
                Profile
              </CNavLink>
            </CNavItem>
          </CNav>

          <div className="flex-grow-1 p-4" style={{ overflow: 'auto' }}>
            <CCard className="shadow-sm h-100">
              <CCardBody className="p-4" style={{ minHeight: '400px' }}>
                <Routes>
                  <Route index element={<Navigate to="/driver/trips" replace />} />
                  <Route path="/trips/*" element={<TripList />} />
                  <Route path="/issues" element={<IssueReportForm />} />
                  <Route path="/profile" element={<DriverProfile />} />
                </Routes>
              </CCardBody>
            </CCard>
          </div>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default DriverPage;