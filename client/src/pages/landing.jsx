import React, { useEffect, useState } from 'react';
import '../styles/landing.css';
import { Link } from 'react-router-dom';
import logo from '../assets/AFA-Logo-mini.png';
import heroImage from '../assets/pixelcut-export.jpg';
import { MdGpsFixed } from 'react-icons/md';
import { GrHostMaintenance } from 'react-icons/gr';
import { FaUser } from 'react-icons/fa';
import { TbReportSearch } from 'react-icons/tb';
import { FaXTwitter, FaLinkedin, FaFacebookF } from 'react-icons/fa6';

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

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="landing-page">
      <div>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="logo">
          <img src={logo} alt="AFA Fleet Management System Logo" className="w-32 h-32" />
        </div>
        <nav className="nav-menu">
          <a href="#home">HOME</a>
          <a href="#features">FEATURES</a>
          <a href="#dashboard">DASHBOARD</a>
          <a href="#testimonials">TESTIMONIALS</a>
        </nav>
      </header>
      </div>

      <main>
        <section className="hero" style={{backgroundImage:`url(${heroImage})`}}>
          <h1>Welcome to AFA Fleet Management System</h1>
          <p>
            Streamline your fleet operations with real-time tracking, automated maintenance alerts, and comprehensive reporting.
          </p>
          <div className="cta-buttons">
            <Link to="/login">
              <button className="btn-primary">Log in</button>
            </Link>
            <Link to="/signup">
              <button className="btn-secondary">Sign up</button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features">
          <div className="feature">
            <MdGpsFixed className="feature-icon" />
            <h3>Real-Time GPS Tracking</h3>
            <p>Monitor your fleet in real-time with live GPS tracking.</p>
          </div>
          <div className="feature">
            <GrHostMaintenance className="feature-icon" />
            <h3>Automated Maintenance Alerts</h3>
            <p>Receive timely alerts for vehicle servicing and maintenance.</p>
          </div>
          <div className="feature">
            <FaUser className="feature-icon" />
            <h3>Driver Management</h3>
            <p>Track driver compliance and performance.</p>
          </div>
          <div className="feature">
            <TbReportSearch className="feature-icon" />
            <h3>Automated Reporting</h3>
            <p>Generate detailed reports on fuel usage, maintenance, and compliance.</p>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section id="dashboard" className="dashboard-preview" >
          <h2>Experience a Centralized Platform</h2>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="testimonials">
          <h2>What Our Users Say</h2>
          <div className="testimonial">
            <p>
              "The Fleet Management System has transformed how we manage our vehicles and drivers. The real-time tracking and automated reports have saved us countless hours."
            </p>
            <p>
              <strong>– Fleet Manager, AFA</strong>
            </p>
          </div>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="footer">
        <div className="contact-info">
          <p>Email: info@afa.go.ke</p>
          <p>Phone: +254 700 638 672</p>
        </div>
        <div className="quick-links">
          <a href="#about">About Us</a>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
        </div>
        <div className="social-media">
          <a href="https://x.com/kenya_afa" aria-label="Twitter" rel="noopener noreferrer">
            <FaXTwitter />
          </a>
          <a
            href="https://www.linkedin.com/company/agriculture-and-food-authority/?originalSubdomain=ke"
            aria-label="LinkedIn"
            rel="noopener noreferrer"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://www.facebook.com/AgricultureFoodAuthorityKenya?_rdc=1&_rdr#"
            aria-label="Facebook"
            rel="noopener noreferrer"
          >
            <FaFacebookF />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
