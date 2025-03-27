import React, {useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  CContainer,
  CNav,
  CNavItem,
  CNavLink,
  CButton,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CBadge,
  CTooltip,
  COffcanvas,
  COffcanvasHeader,
  COffcanvasTitle,
  CCloseButton,
  COffcanvasBody
} from '@coreui/react';
import { CIcon } from '@coreui/icons-react';
import { 
  cilWarning, 
  cilUser, 
  cilAccountLogout, 
  cilTruck, 
  cilBell,
  cilChevronBottom,
  cilMenu
} from '@coreui/icons';
import TripList from '../driver/TripList';
import IssueReportForm from '../driver/IssueReportForm';
import DriverProfile from '../driver/DriverProfile';

const DriverPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userData = JSON.parse(localStorage.getItem('userData'));
  const userId = localStorage.getItem('userId');

  console.log("Stored userId:", localStorage.getItem("userId"));
console.log("Stored userData:", localStorage.getItem("userData"));


  useEffect(() => {
    if (!userId) {
      navigate('/');
    }
  }, [userId, navigate]); // Add dependencies

  if (!userId) {
    return null; // Optional loading state
  }


  const handleLogout = () => {
    const driverAuthItems = [
      'driverToken',
      'userRole', 
      'userId',
      'userData'
    ];
    
    driverAuthItems.forEach(item => localStorage.removeItem(item));
    
    // Clear React Router state
    navigate('/login', {
      replace: true,
      state: {
        from: 'driver',
        message: 'Driver logged out successfully'
      }
    });
  };
  const NavItems = [
    { 
      icon: cilTruck, 
      label: 'Trips', 
      path: '/driver/trips' 
    },
    { 
      icon: cilWarning, 
      label: 'Incidents', 
      path: '/driver/issues' 
    },
    { 
      icon: cilUser, 
      label: 'Profile', 
      path: '/driver/profile' 
    }
  ];

  const renderNavItems = (isMobile = false) => (
    <CNav variant="pills" className={`${isMobile ? 'd-flex flex-column' : 'd-none d-lg-flex'} gap-2`}>
      {NavItems.map((item) => (
        <CNavItem key={item.path}>
          <CNavLink 
            as={Link} 
            to={item.path} 
            className="px-3 py-2"
            active={location.pathname.startsWith(item.path)}
            onClick={() => {
              if (isMobile) setIsMobileMenuOpen(false);
            }}
          >
            <CIcon icon={item.icon} className="me-2" />
            {item.label}
          </CNavLink>
        </CNavItem>
      ))}
    </CNav>
  );

  return (
    <CContainer 
      fluid 
      className="min-vh-100 d-flex flex-column p-0 bg-light"
      style={{
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}
    >
      {/* Mobile Offcanvas Menu */}
      <COffcanvas 
        placement="start" 
        visible={isMobileMenuOpen} 
        onHide={() => setIsMobileMenuOpen(false)}
      >
        <COffcanvasHeader>
          <COffcanvasTitle>
            <div className="d-flex align-items-center gap-2">
              <h3 className="mb-0 text-primary fw-bold">Driver Portal</h3>
            </div>
          </COffcanvasTitle>
          <CCloseButton className="text-reset" onClick={() => setIsMobileMenuOpen(false)} />
        </COffcanvasHeader>
        <COffcanvasBody>
          {renderNavItems(true)}
          <div className="mt-3 border-top pt-3">
            <CButton 
              color="danger" 
              className="w-100" 
              onClick={handleLogout}
            >
              <CIcon icon={cilAccountLogout} className="me-2" />
              Log Out
            </CButton>
          </div>
        </COffcanvasBody>
      </COffcanvas>

      {/* Header */}
      <header 
        className="sticky-top bg-white shadow-sm" 
        style={{ 
          zIndex: 1000, 
          borderBottom: '1px solid rgba(0,0,0,0.1)' 
        }}
      >
        <div className="container-fluid px-4">
          <div className="d-flex justify-content-between align-items-center py-3">
            {/* Left Section - Logo & Mobile Menu */}
            <div className="d-flex align-items-center gap-3">
              <CTooltip content="Main Menu">
                <CButton 
                  color="link" 
                  className="p-2 d-lg-none"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <CIcon icon={cilMenu} size="xl" className="text-dark" />
                </CButton>
              </CTooltip>

              <div className="d-flex align-items-center gap-2">
                <h2 className="mb-0 text-primary fw-bold fs-4">
                  Driver Portal
                </h2>
              </div>
            </div>

            {/* Center Section - Navigation Links */}
            {renderNavItems()}

            {/* Right Section - Controls */}
            <div className="d-flex align-items-center gap-3">
              <CTooltip content="Notifications">
                <CButton 
                  color="light" 
                  className="p-2 position-relative rounded-circle"
                >
                  <CIcon icon={cilBell} className="text-dark" />
                  <CBadge 
                    color="danger" 
                    shape="rounded-pill" 
                    className="position-absolute top-0 end-0 translate-middle"
                    style={{ fontSize: '0.6rem', padding: '2px 5px' }}
                  >
                    3
                  </CBadge>
                </CButton>
              </CTooltip>

              <CDropdown alignment="end">
                <CDropdownToggle 
                  color="light" 
                  className="d-flex align-items-center gap-2 pe-3 rounded-pill"
                  style={{ 
                    backgroundColor: 'rgba(33, 150, 243, 0.05)', 
                    border: '1px solid rgba(33, 150, 243, 0.1)' 
                  }}
                >
                  <div 
                    className="bg-primary d-flex align-items-center justify-content-center rounded-circle"
                    style={{ width: '40px', height: '40px' }}
                  >
                    <span className="text-white fw-medium fs-5">
                      {userData?.firstName?.[0] || 'D'}
                    </span>
                  </div>
                  <div className="text-start d-none d-md-block">
                    <div className="fw-medium text-dark">{userData?.firstName || 'Driver'}</div>
                    <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                      {userData?.role || 'Driver'}
                    </small>
                  </div>
                  <CIcon 
                    icon={cilChevronBottom} 
                    className="ms-1 text-muted"
                    style={{ fontSize: '0.75rem' }} 
                  />
                </CDropdownToggle>
                <CDropdownMenu 
                  className="shadow-lg border-0 mt-2" 
                  style={{ 
                    minWidth: '220px', 
                    borderRadius: '0.75rem' 
                  }}
                >
                  <CDropdownItem 
                    onClick={() => navigate('/driver/profile')}
                    className="d-flex align-items-center"
                    style={{ cursor: 'pointer' }}
                  >
                    <CIcon icon={cilUser} className="me-2 text-primary" />
                    My Profile
                  </CDropdownItem>
                  <CDropdownItem 
                    onClick={handleLogout} 
                    className="text-danger d-flex align-items-center"
                    style={{ cursor: 'pointer' }}
                  >
                    <CIcon icon={cilAccountLogout} className="me-2 text-danger" />
                    Log Out
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        className="flex-grow-1"
        style={{ 
          overflowY: 'auto',
          height: 'calc(100vh - 76px)',
          marginTop: '76px',
          backgroundColor: '#f4f6f9'
        }}
      >
        <div className="container-fluid px-4 py-4">
          <Routes>
            <Route index element={<Navigate to="/driver/trips" replace />} />
            <Route path="trips/*" element={<TripList userId={userId} />} />
            <Route path="issues" element={<IssueReportForm />} />
            <Route path="profile" element={<DriverProfile />} />
          </Routes>
        </div>
      </main>

      <style jsx>{`
        /* Enhanced active navigation styles */
        .nav-pills .nav-link {
          transition: all 0.3s ease;
          border-radius: 0.5rem;
        }

        .nav-pills .nav-link.active {
          background-color: rgba(33, 150, 243, 0.1);
          color: #2196f3 !important;
          font-weight: 600;
        }

        .nav-pills .nav-link:hover:not(.active) {
          background-color: rgba(33, 150, 243, 0.05);
        }
          
         .dropdown-toggle::after {
          display: none !important;
        }

        /* Responsive adjustments */
        @media (max-width: 992px) {
          .container-fluid {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
        }
      `}</style>
    </CContainer>
  );
};

export default DriverPage;