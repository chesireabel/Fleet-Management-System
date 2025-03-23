import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; 
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardGroup,
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CAlert,
  CLink,
} from '@coreui/react';

function Login() {
  const navigate = useNavigate();

  // State to manage form inputs
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // State to manage validation errors
  const [errors, setErrors] = useState({});

  // State to manage login error message
  const [loginError, setLoginError] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({ ...errors, [name]: '' }); // Clear errors when the user types
  };

  // Validate form inputs
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post('http://localhost:3000/users/login', formData);
  
        // Handle successful login
        console.log('Login successful:', response.data);
  
        // Save the token to localStorage (for authentication)
        localStorage.setItem('token', response.data.token);
  
        const userRole = response.data.data.user.role;
        console.log('User Role:', userRole);
        if (userRole === 'fleet_manager') {
          navigate('/dashboard');
        } else if (userRole === 'driver') {
          navigate('/driver');
        } else if (userRole === 'maintenance_team') {
          navigate('/maintenance/dashboard');
        } else if (userRole === 'finance_team') {
          navigate('/finance/dashboard');
        } else if (userRole === 'senior_management') {
          navigate('/senior-management/dashboard');
        } else {
          navigate('/'); // Default fallback
        }
      } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
  
        // Handle login errors
        if (error.response?.data.message) {
          setLoginError(error.response.data.message);
        } else {
          setLoginError('An error occurred during login. Please try again.');
        }
      }
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              {/* Left Side: Login Form */}
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-medium-emphasis">Sign In to your account</p>

                    {/* Email Input */}
                    <div className="mb-3">
                      <CFormLabel>Email</CFormLabel>
                      <CFormInput
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        invalid={!!errors.email}
                      />
                      {errors.email && <div className="text-danger">{errors.email}</div>}
                    </div>

                    {/* Password Input */}
                    <div className="mb-4">
                      <CFormLabel>Password</CFormLabel>
                      <CFormInput
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        invalid={!!errors.password}
                      />
                      {errors.password && <div className="text-danger">{errors.password}</div>}
                    </div>

                    {/* Submit Button */}
                    <CRow>
                      <CCol xs={6}>
                        <CButton type="submit" color="primary" className="px-4">
                          Login
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-end">
                        <CLink href="#" className="text-decoration-none">
                          Forgot password?
                        </CLink>
                      </CCol>
                    </CRow>

                    {/* Login Error Message */}
                    {loginError && (
                      <CAlert color="danger" className="mt-3">
                        {loginError}
                      </CAlert>
                    )}
                  </CForm>
                </CCardBody>
              </CCard>

              {/* Right Side: Welcome Message */}
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Welcome to AFA </h2>
                    <p>
                      Don't have an account?
                    </p>
                    <Link to='/signup'>
                    <CButton color="light" variant="outline" className="mt-3">
                      Sign Up
                    </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
}

export default Login;