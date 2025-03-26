import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; 
import { Eye, EyeOff } from 'lucide-react';
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

// Centralized configuration
const CONFIG = {
  API_URL:import.meta.env.VITE_API_URL || 'http://localhost:3000',
  ROUTE_MAP: {
    'fleet_manager': '/dashboard',
    'driver': '/driver',
    'maintenance_team': '/maintenance/dashboard',
    'finance_team': '/finance/dashboard',
    'senior_management': '/senior-management/dashboard',
    'default': '/'
  }
};

function Login() {
  const navigate = useNavigate();

  // Enhanced state management
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [uiState, setUiState] = useState({
    errors: {},
    loginError: '',
    isLoading: false,
    showPassword: false
  });

  // Load remembered email from localStorage
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true
      }));
    }
  }, []);

  // Enhanced input change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear specific error when user starts typing
    setUiState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: '' },
      loginError: ''
    }));
  };

  // More robust form validation
  const validateForm = () => {
    const newErrors = {};

    // Email validation with more comprehensive regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation with more checks
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    setUiState(prev => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  

  // Handle form submission with improved error handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset previous states
    setUiState(prev => ({ 
      ...prev, 
      loginError:'', 
      isLoading: true 
    }));

    if (validateForm()) {
      try {
        // Remember email if checkbox is checked
        if (formData.rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        const response = await axios.post(`${CONFIG.API_URL}/users/login`, {
          email: formData.email,
          password: formData.password
        });
  
 
        const { 
          token, 
          data = {}, 
          user = {}
        } = response.data;

        console.log('Full Backend Response:', response.data);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));


        const driverId = user._id || data.user?._id;



         // Log specific fields
      console.log('Token:', token);
      console.log('Data Object:', data);
      console.log('User Object:', user);
      console.log('Driver ID:', driverId);

        

        // Save the token and user info
       
        
        // Multiple approaches to store driver ID
        if (driverId) {
          localStorage.setItem('driverId', driverId);
        }
        if (user.driverId) {
          localStorage.setItem('driverId', user.driverId);
        }
        if (data.user?.driverId) {
          localStorage.setItem('driverId', data.user.driverId);
        }

        localStorage.setItem('token', token || '');
        localStorage.setItem('userRole', user.role || data.user?.role || '');

              // Store full user data for inspection
      localStorage.setItem('userData', JSON.stringify({
        ...user,
        ...data.user
      }));
     
    //  localStorage.clear();
    console.log('Stored Driver ID:', localStorage.getItem('driverId'));
      console.log('Stored User Data:', localStorage.getItem('userData'));

      const userRole = localStorage.getItem('userRole') || ''; 

        // Navigate based on role, with fallback
        const destinationRoute = CONFIG.ROUTE_MAP[userRole] || CONFIG.ROUTE_MAP.default;
        
        navigate(destinationRoute);
      } catch (error) {
        console.error("Login Error:", error); 
         const errorMessage = error.response?.data?.message || 
        error.message || 
        'An unexpected error occurred. Please try again.';
        
        setUiState(prev => ({ 
          ...prev, 
          loginError: errorMessage,
          isLoading: false 
        }));
      }
    } else {
      setUiState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setUiState(prev => ({ 
      ...prev, 
      showPassword: !prev.showPassword 
    }));
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
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
                        invalid={!!uiState.errors.email}
                      />
                      {uiState.errors.email && (
                        <div className="text-danger">{uiState.errors.email}</div>
                      )}
                    </div>

                    {/* Password Input with Visibility Toggle */}
                    <div className="mb-3">
                      <CFormLabel>Password</CFormLabel>
                      <div className="position-relative">
                        <CFormInput
                          type={uiState.showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleChange}
                          invalid={!!uiState.errors.password}
                        />
                        <button
                          type="button"
                          className="position-absolute end-0 top-50 translate-middle-y me-2 btn btn-link"
                          onClick={togglePasswordVisibility}
                        >
                          {uiState.showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {uiState.errors.password && (
                        <div className="text-danger">{uiState.errors.password}</div>
                      )}
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="mb-3 form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="rememberMe"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="rememberMe">
                        Remember me
                      </label>
                    </div>

                    {/* Submit Button with Loading State */}
                    <CRow>
                      <CCol xs={6}>
                        <CButton 
                          type="submit" 
                          color="primary" 
                          className="px-4"
                          disabled={uiState.isLoading}
                        >
                          {uiState.isLoading ? 'Logging in...' : 'Login'}
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-end">
                        <CLink href="/forgot-password" className="text-decoration-none">
                          Forgot password?
                        </CLink>
                      </CCol>
                    </CRow>

                    {/* Error Handling */}
                    {uiState.loginError && (
                      <CAlert color="danger" className="mt-3">
                        {uiState.loginError}
                      </CAlert>
                    )}
                  </CForm>
                </CCardBody>
              </CCard>

              {/* Signup Section */}
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Welcome to AFA</h2>
                    <p>Don't have an account?</p>
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