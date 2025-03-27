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
  CLink,
  CImage,
} from '@coreui/react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../../assets/AFA-Logo-mini.png';
import { MdGpsFixed } from 'react-icons/md';
import { GrHostMaintenance } from 'react-icons/gr';
import { FaUser, FaQuoteLeft, FaQuoteRight } from 'react-icons/fa';
import { TbReportSearch } from 'react-icons/tb';
import { FaXTwitter, FaLinkedin, FaFacebookF } from 'react-icons/fa6';
import './LandingPage.css';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { 
      icon: <MdGpsFixed />, 
      title: 'Real-Time GPS Tracking', 
      text: 'Monitor your fleet with precise, live GPS tracking and comprehensive route analysis.',
      // details: [
      //   'Instant location updates',
      //   'Route optimization',
      //   'Geofencing alerts'
      // ]
    },
    { 
      icon: <GrHostMaintenance />, 
      title: 'Automated Maintenance', 
      text: 'Proactively manage vehicle health with intelligent maintenance scheduling.',
      // details: [
      //   'Service reminders',
      //   'Predictive maintenance',
      //   'Cost reduction'
      // ]
    },
    { 
      icon: <FaUser />, 
      title: 'Driver Management', 
      text: 'Enhance driver performance and safety with comprehensive monitoring.',
      // details: [
      //   'Behavior scoring',
      //   'Compliance tracking',
      //   'Performance insights'
      // ]
    },
    { 
      icon: <TbReportSearch />, 
      title: 'Comprehensive Reporting', 
      text: 'Generate detailed, customizable reports for deep operational insights.',
      // details: [
      //   'Fuel usage reports',
      //   'Compliance documentation',
      //   'Performance metrics'
      // ]
    }
  ];

  const fadeInVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="landing-page">
      {/* Header with Improved Navbar */}
      <CNavbar 
        expand="lg" 
        className={`p-3 ${scrolled ? 'bg-white shadow-sm' : 'bg-transparent'}`}
        fixed="top"
        style={{ 
          zIndex: 1050,
          transition: 'all 0.3s ease',
          backgroundColor: scrolled ? 'white' : 'rgba(255, 255, 255, 0.2)',
          position:"fixed",
          width: '100%',
          top: 0,
          left: 0,
          boxShadow: scrolled ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
          backdropFilter: scrolled ? 'none' : 'blur(5px)',
          WebkitBackdropFilter: scrolled ? 'none' : 'blur(5px)'
        }}
      >
        <CContainer>
          <CNavbarBrand href="#" className="d-flex align-items-center">
            <CImage 
              src={logo} 
              alt="AFA Fleet Management System Logo" 
              className="me-3"
              style={{ 
                width: '50px', 
                height: '50px', 
                objectFit: 'contain' 
              }}
            />
            <span className="fw-bold text-primary">AFA Fleet</span>
          </CNavbarBrand>
          <CNav className="ms-auto align-items-center">
            <CNavLink href="#home-afa" className="mx-2 text-dark fw-semibold" onClick={(e) => {
      e.preventDefault();
      document.getElementById("home-afa")?.scrollIntoView({ behavior: "smooth" });
    }}>HOME</CNavLink>
            <CNavLink href="#features" className="mx-2 text-dark fw-semibold" onClick={(e) => {
      e.preventDefault();
      document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
    }}>FEATURES</CNavLink>
            <CNavLink href="#dashboard-afa" className="mx-2 text-dark fw-semibold" onClick={(e) => {
      e.preventDefault();
      document.getElementById("dashboard-afa")?.scrollIntoView({ behavior: "smooth" });
    }}>DASHBOARD</CNavLink>
            <CNavLink href="#testimonials" className="mx-2 text-dark fw-semibold"  onClick={(e) => {
      e.preventDefault();
      document.getElementById("testimonials")?.scrollIntoView({ behavior: "smooth" });
    }}>TESTIMONIALS</CNavLink>
          </CNav>
        </CContainer>
      </CNavbar>

      {/* Hero Section with Enhanced Styling */}
      <motion.section 
        id="home-afa" 
        className="hero d-flex align-items-center min-vh-100 "
        style={{
           scrollMarginTop: "80px",
            backgroundColor: "#004080"
           }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <CContainer>
          <CRow className="align-items-center">
            <CCol md={7} className="text-start">
              <motion.h1 
                className="display-4 mb-4 text-white fw-bold"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                Revolutionize Your Fleet Management
              </motion.h1>
              <motion.p 
                className="lead mb-5 text-white "
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Streamline your fleet operations with real-time tracking, automated maintenance alerts, and comprehensive reporting.
              </motion.p>
              <motion.div 
                className="d-flex"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Link to="/login" className="me-3">
                  <CButton color="primary" size="lg" className="px-4 py-2">Log In</CButton>
                </Link>
                <Link to="/signup">
                  <CButton color="outline-primary" size="lg" className="px-4 py-2 text-white">Sign Up</CButton>
                </Link>
              </motion.div>
            </CCol>
            <CCol md={5} className="text-center">
              <motion.img 
                src="/api/placeholder/500/400" 
                alt="Fleet Management Dashboard" 
                className="img-fluid rounded shadow-lg"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
              />
            </CCol>
          </CRow>
        </CContainer>
      </motion.section>

      {/* Features Section with Improved Card Design */}
      <section id="features" className="features py-5 bg-light">
        <CContainer>
          <motion.h2 
            className="text-center mb-5 text-primary fw-bold"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Key Features
          </motion.h2>
          <CRow className="g-4">
            {features.map((feature, index) => (
              <CCol md={3} key={index}>
                <motion.div
                  variants={fadeInVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <CCard className="h-100 text-center p-4 feature-card shadow-sm hover:shadow-lg transition-all">
                    <CCardBody>
                      <div className="feature-icon mb-4">
                        {React.cloneElement(feature.icon, { 
                          className: 'display-4 text-primary mb-3' 
                        })}
                      </div>
                      <h3 className="h4 mb-3 text-primary">{feature.title}</h3>
                      <CCardText className="text-muted mb-3">{feature.text}</CCardText>
                      {/* <ul className="list-unstyled text-start">
                        {feature.details.map((detail, idx) => (
                          <li key={idx} className="mb-2">
                            <span className="text-primary me-2">✓</span>
                            <small className="text-muted">{detail}</small>
                          </li>
                        ))}
                      </ul> */}
                    </CCardBody>
                  </CCard>
                </motion.div>
              </CCol>
            ))}
          </CRow>
        </CContainer>
      </section>

      {/* Dashboard Preview Section */}
      <section id="dashboard-afa" className="dashboard-preview py-5">
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={8} className="text-center">
              <motion.h2 
                className="mb-4 text-primary"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Experience a Centralized Platform
              </motion.h2>
              <motion.p 
                className="lead text-muted mb-4"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Access all your fleet data in one intuitive dashboard
              </motion.p>
              <motion.img 
                src="/api/placeholder/800/400" 
                alt="Dashboard Preview" 
                className="img-fluid rounded shadow-lg"
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
              />
            </CCol>
          </CRow>
        </CContainer>
      </section>

      {/* Testimonials Section with Enhanced Design */}
      <section id="testimonials" className="testimonials py-5 bg-light">
        <CContainer>
          <motion.h2 
            className="text-center mb-5 text-primary fw-bold"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            What Our Users Say
          </motion.h2>
          <CRow className="justify-content-center">
            <CCol md={8}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <CCard className="testimonial-card shadow-sm border-0">
                  <CCardBody className="p-5 text-center">
                    <FaQuoteLeft className="text-primary mb-3" size={40} />
                    <blockquote className="blockquote mb-4">
                      <p className="lead text-muted">
                        "The Fleet Management System has transformed how we manage our vehicles and drivers. The real-time tracking and automated reports have saved us countless hours."
                      </p>
                    </blockquote>
                    <FaQuoteRight className="text-primary mt-3" size={40} />
                    <footer className="blockquote-footer mt-3">
                      <strong className="text-primary">– Fleet Manager, AFA</strong>
                    </footer>
                  </CCardBody>
                </CCard>
              </motion.div>
            </CCol>
          </CRow>
        </CContainer>
      </section>

      {/* Footer Section */}
      <footer className="footer bg-dark text-white py-5">
        <CContainer>
          <CRow className="g-4">
            <CCol md={4}>
              <div className="contact-info">
                <h5 className="mb-3">Contact Us</h5>
                <p className="mb-1">Email: info@afa.go.ke</p>
                <p>Phone: +254 700 638 672</p>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="quick-links">
                <h5 className="mb-3">Quick Links</h5>
                <CLink href="#about" className="d-block text-white text-decoration-none mb-2">About Us</CLink>
                <CLink href="#privacy" className="d-block text-white text-decoration-none mb-2">Privacy Policy</CLink>
                <CLink href="#terms" className="d-block text-white text-decoration-none">Terms of Service</CLink>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="social-media">
                <h5 className="mb-3">Follow Us</h5>
                <div className="d-flex gap-3 mt-3">
                  <CLink href="https://x.com/kenya_afa" className="text-white hover:text-primary">
                    <FaXTwitter size={24} />
                  </CLink>
                  <CLink href="https://www.linkedin.com/company/agriculture-and-food-authority" className="text-white hover:text-primary">
                    <FaLinkedin size={24} />
                  </CLink>
                  <CLink href="https://www.facebook.com/AgricultureFoodAuthorityKenya" className="text-white hover:text-primary">
                    <FaFacebookF size={24} />
                  </CLink>
                </div>
              </div>
            </CCol>
          </CRow>
          <CRow className="mt-4 text-center">
            <CCol>
              <p className="mb-0 text-muted">&copy; 2025 AFA Fleet Management. All rights reserved.</p>
            </CCol>
          </CRow>
        </CContainer>
      </footer>
    </div>
  );
};

export default LandingPage;