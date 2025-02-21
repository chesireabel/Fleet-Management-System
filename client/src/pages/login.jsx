import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // Import axios for backend requests
import '../styles/login.css';

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
        // Send a POST request to the backend for login
        const response = await axios.post('http://localhost:3000/users/login', formData);

        // Handle successful login
        console.log('Login successful:', response.data);

        // Save the token to localStorage (for authentication)
        localStorage.setItem('token', response.data.token);

        // Redirect to the dashboard or home page
        navigate('/dashboard');
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

  // Handle close button click
  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="login-container">
      <button className="close-button" onClick={handleClose}>
        &times;
      </button>
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
        {/* Email */}
        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {errors.email && <span className="error">{errors.email}</span>}
        <hr className="hr-line" />

        {/* Password */}
        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {errors.password && <span className="error">{errors.password}</span>}
        <hr className="hr-line" />

        {/* Forgot Password Link */}
        <a href="#" className="forgot-password">
          Forgot password?
        </a>

        {/* Login Error Message */}
        {loginError && <span className="error">{loginError}</span>}

        {/* Submit Button */}
        <input type="submit" value="Log In" className="submit-button" />
      </form>

      {/* Link to Signup Page */}
      <p className="signup-link">
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}

export default Login;