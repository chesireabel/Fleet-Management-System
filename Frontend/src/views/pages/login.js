import React, { useState, useEffect, useCallback } from 'react';
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

// Centralized Token Management Utility
const TokenManager = {
  // Clear all tokens for clean slate
  clearAllTokens() {
    const tokensToRemove = [
      'token', 
      'driverToken', 
      'managerToken', 
      'maintenanceToken', 
      'userRole', 
      'userId', 
      'userData'
    ];
    
    tokensToRemove.forEach(tokenKey => 
      localStorage.removeItem(tokenKey)
    );
  },

  // Set token based on role with more robust checks
  setToken(role, token) {
    if (!role || !token) {
      console.error('Invalid token or role');
      return false;
    }

    // Clear previous tokens first
    this.clearAllTokens();

    // Role-specific token storage
    const tokenMap = {
      'driver': 'driverToken',
      'fleet_manager': 'managerToken',
      'maintenance_team': 'maintenanceToken',
      'finance_team': 'financeToken',
      'senior_management': 'seniorManagementToken'
    };

    const tokenKey = tokenMap[role];
    
    if (!tokenKey) {
      console.error(`Unsupported role: ${role}`);
      return false;
    }

    try {
      localStorage.setItem(tokenKey, token);
      localStorage.setItem('userRole', role);
      return true;
    } catch (error) {
      console.error('Token storage failed:', error);
      return false;
    }
  },

  // Get current active token based on role
  getCurrentToken(role) {
    const tokenMap = {
      'driver': 'driverToken',
      'fleet_manager': 'managerToken',
      'maintenance_team': 'maintenanceToken',
      'finance_team': 'financeToken',
      'senior_management': 'seniorManagementToken'
    };

    const tokenKey = tokenMap[role];
    return tokenKey ? localStorage.getItem(tokenKey) : null;
  },

  // Validate token existence and match with current role
  validateTokenForRole(role) {
    const token = this.getCurrentToken(role);
    const currentRole = localStorage.getItem('userRole');
    return token && currentRole === role;
  }
};

// Centralized configuration
const CONFIG = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
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
  
  const togglePasswordVisibility = () => {
    setUiState(prev => ({
      ...prev,
      showPassword: !prev.showPassword
    }));
  };

  // Memoized email loading to prevent unnecessary re-renders
  const loadRememberedEmail = useCallback(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true
      }));
    }
  }, []);

  // Use useEffect with memoized callback
  useEffect(() => {
    loadRememberedEmail();
  }, [loadRememberedEmail]);

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
      loginError: '', 
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

        const { token, data = {}, user = {}} = response.data;
        
        // Extract user role from response
        const userRole = user.role || data.user?.role || "";
        if (!userRole) {
          throw new Error("User role not found in response");
        }

        // Use centralized token management
        const tokenSet = TokenManager.setToken(userRole, token);
        
        if (!tokenSet) {
          throw new Error("Token storage failed");
        }

        // Store user metadata
        const userId = user.id || user._id || data.user?.id || data.user?._id;
        if (!userId) {
          throw new Error("User ID not found in response");
        }

        localStorage.setItem('userId', userId);
        
        try {
          localStorage.setItem('userData', JSON.stringify({
            ...user,
            ...data.user
          }));
        } catch (storageError) {
          console.error('Error storing user data:', storageError);
        }

        const destinationRoute = CONFIG.ROUTE_MAP[userRole] || CONFIG.ROUTE_MAP.default;
        navigate(destinationRoute);

      } catch (error) {
        console.error("Login Error:", error);
        const errorMessage = 
          error.response?.data?.message || 
          error.message || 
          'An unexpected error occurred. Please try again.';
        
        if (error.response?.status === 400 && error.response?.data?.message.includes('jwt malformed')) {
          setUiState(prev => ({ ...prev, loginError: 'Invalid token. Please log in again.', isLoading: false }));
        } else {
          setUiState(prev => ({ ...prev, loginError: errorMessage, isLoading: false }));
        }
      }
    } else {
      setUiState(prev => ({ ...prev, isLoading: false }));
    }
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

                    {/* Email Input with Enhanced Accessibility */}
                    <div className="mb-3">
                      <CFormLabel htmlFor="email">Email</CFormLabel>
                      <CFormInput
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        invalid={!!uiState.errors.email}
                        aria-describedby="emailError"
                      />
                      {uiState.errors.email && (
                        <div 
                          id="emailError" 
                          className="text-danger" 
                          role="alert"
                        >
                          {uiState.errors.email}
                        </div>
                      )}
                    </div>

                    {/* Password Input with Visibility Toggle and Improved Accessibility */}
                    <div className="mb-3">
                      <CFormLabel htmlFor="password">Password</CFormLabel>
                      <div className="position-relative">
                        <CFormInput
                          id="password"
                          type={uiState.showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleChange}
                          invalid={!!uiState.errors.password}
                          aria-describedby="passwordError"
                        />
                        <button
                          type="button"
                          className="position-absolute end-0 top-50 translate-middle-y me-2 btn btn-link"
                          onClick={togglePasswordVisibility}
                          aria-label={uiState.showPassword ? "Hide password" : "Show password"}
                        >
                          {uiState.showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {uiState.errors.password && (
                        <div 
                          id="passwordError" 
                          className="text-danger" 
                          role="alert"
                        >
                          {uiState.errors.password}
                        </div>
                      )}
                    </div>

                    {/* Remember Me Checkbox with Improved Accessibility */}
                    <div className="mb-3 form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="rememberMe"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                      />
                      <label 
                        className="form-check-label" 
                        htmlFor="rememberMe"
                      >
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
                          aria-busy={uiState.isLoading}
                        >
                          {uiState.isLoading ? 'Logging in...' : 'Login'}
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-end">
                        <CLink 
                          href="/forgot-password" 
                          className="text-decoration-none"
                        >
                          Forgot password?
                        </CLink>
                      </CCol>
                    </CRow>

                    {/* Error Handling with Improved Accessibility */}
                    {uiState.loginError && (
                      <CAlert 
                        color="danger" 
                        className="mt-3"
                        role="alert"
                        aria-live="assertive"
                      >
                        {uiState.loginError}
                      </CAlert>
                    )}
                  </CForm>
                </CCardBody>
              </CCard>

              {/* Signup Section */}
              <CCard 
                className="text-white bg-primary py-5" 
                style={{ width: '44%' }}
              >
                <CCardBody className="text-center">
                  <div>
                    <h2>Welcome to AFA</h2>
                    <p>Don't have an account?</p>
                    <Link to='/signup'>
                      <CButton 
                        color="light" 
                        variant="outline" 
                        className="mt-3"
                      >
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

// Recommended use in protected routes or components
export { TokenManager };