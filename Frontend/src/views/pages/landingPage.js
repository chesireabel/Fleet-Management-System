import React, { useEffect, useState } from 'react';
import {
  CNavbar,
  CNavbarBrand,
  CNav,
  CNavLink,
  CContainer,
  CRow,
  CCol,
  CButton,
  CCard,
  CCardBody,
  CCardText,
  CLink
} from '@coreui/react';
import { Link } from 'react-router-dom';
import { MdGpsFixed } from 'react-icons/md';
import { GrHostMaintenance } from 'react-icons/gr';
import { FaUser } from 'react-icons/fa';
import { TbReportSearch } from 'react-icons/tb';
import { FaXTwitter, FaLinkedin, FaFacebookF } from 'react-icons/fa6';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      <CNavbar expand="lg" className={`p-3 ${scrolled ? 'bg-white shadow-sm' : 'bg-transparent'}`} fixed="top">
        <CContainer>
          <CNavbarBrand href="#">
          </CNavbarBrand>
          <CNav className="ms-auto">
            <CNavLink href="#home">HOME</CNavLink>
            <CNavLink href="#features">FEATURES</CNavLink>
            <CNavLink href="#dashboard">DASHBOARD</CNavLink>
            <CNavLink href="#testimonials">TESTIMONIALS</CNavLink>
          </CNav>
        </CContainer>
      </CNavbar>

      <main>
        <section className="hero" >
          <CContainer className="h-100 d-flex align-items-center">
            <CRow className="justify-content-center text-center text-white">
              <CCol md={8}>
                <h1 className="display-4 mb-4">Welcome to AFA Fleet Management System</h1>
                <p className="lead mb-5">
                  Streamline your fleet operations with real-time tracking, automated maintenance alerts, and comprehensive reporting.
                </p>
                <div className="cta-buttons">
                  <Link to="/login">
                    <CButton color="primary" className="me-3 px-4 py-2">Log in</CButton>
                  </Link>
                  <Link to="/signup">
                    <CButton color="light" variant="outline" className="px-4 py-2">Sign up</CButton>
                  </Link>
                </div>
              </CCol>
            </CRow>
          </CContainer>
        </section>

        <section id="features" className="py-5">
          <CContainer>
            <CRow className="g-4">
              <CCol md={3}>
                <CCard className="h-100 text-center p-4">
                  <CCardBody>
                    <MdGpsFixed className="feature-icon display-4 mb-3 text-primary" />
                    <h3>Real-Time GPS Tracking</h3>
                    <CCardText>Monitor your fleet in real-time with live GPS tracking.</CCardText>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol md={3}>
                <CCard className="h-100 text-center p-4">
                  <CCardBody>
                    <GrHostMaintenance className="feature-icon display-4 mb-3 text-primary" />
                    <h3>Automated Maintenance</h3>
                    <CCardText>Receive timely alerts for vehicle servicing.</CCardText>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol md={3}>
                <CCard className="h-100 text-center p-4">
                  <CCardBody>
                    <FaUser className="feature-icon display-4 mb-3 text-primary" />
                    <h3>Driver Management</h3>
                    <CCardText>Track driver compliance and performance.</CCardText>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol md={3}>
                <CCard className="h-100 text-center p-4">
                  <CCardBody>
                    <TbReportSearch className="feature-icon display-4 mb-3 text-primary" />
                    <h3>Automated Reporting</h3>
                    <CCardText>Detailed reports on fuel usage and compliance.</CCardText>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </CContainer>
        </section>

        <section id="dashboard" className="py-5 bg-light">
          <CContainer>
            <CRow className="justify-content-center">
              <CCol md={8} className="text-center">
                <h2 className="mb-4">Experience a Centralized Platform</h2>
                {/* Add dashboard preview component here */}
              </CCol>
            </CRow>
          </CContainer>
        </section>

        <section id="testimonials" className="py-5">
          <CContainer>
            <CRow className="justify-content-center">
              <CCol md={8} className="text-center">
                <h2 className="mb-5">What Our Users Say</h2>
                <CCard className="testimonial-card">
                  <CCardBody>
                    <blockquote className="blockquote mb-0">
                      <p className="lead">
                        "The Fleet Management System has transformed how we manage our vehicles. The real-time tracking and automated reports have saved us countless hours."
                      </p>
                      <footer className="blockquote-footer mt-3">
                        <strong>Fleet Manager, AFA</strong>
                      </footer>
                    </blockquote>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </CContainer>
        </section>
      </main>

      <footer className="bg-dark text-white py-5">
        <CContainer>
          <CRow className="g-4">
            <CCol md={4}>
              <div className="contact-info">
                <h5>Contact Us</h5>
                <p className="mb-1">Email: info@afa.go.ke</p>
                <p>Phone: +254 700 638 672</p>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="quick-links">
                <h5>Quick Links</h5>
                <CLink href="#about" className="d-block text-white text-decoration-none">About Us</CLink>
                <CLink href="#privacy" className="d-block text-white text-decoration-none">Privacy Policy</CLink>
                <CLink href="#terms" className="d-block text-white text-decoration-none">Terms of Service</CLink>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="social-media">
                <h5>Follow Us</h5>
                <div className="d-flex gap-3 mt-3">
                  <CLink href="https://x.com/kenya_afa" className="text-white">
                    <FaXTwitter size={24} />
                  </CLink>
                  <CLink href="https://www.linkedin.com/company/agriculture-and-food-authority" className="text-white">
                    <FaLinkedin size={24} />
                  </CLink>
                  <CLink href="https://www.facebook.com/AgricultureFoodAuthorityKenya" className="text-white">
                    <FaFacebookF size={24} />
                  </CLink>
                </div>
              </div>
            </CCol>
          </CRow>
          <CRow className="mt-4 text-center">
            <CCol>
              <p className="mb-0">&copy; 2024 AFA Fleet Management. All rights reserved.</p>
            </CCol>
          </CRow>
        </CContainer>
      </footer>
    </div>
  );
};

export default LandingPage;