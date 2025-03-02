import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../components/modal.jsx'; 
import '../styles/signup.css';

function Signup() {
  const navigate = useNavigate();

  // State to manage form inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    agreeToTerms: false,
  });

  // State to manage validation errors
  const [errors, setErrors] = useState({});

  // State to control modal visibility and messages
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('success');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setErrors({ ...errors, [name]: '' }); // Clear errors when the user types
  };

  // Validate form inputs
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    // Terms and Conditions validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post('http://localhost:3000/users/register', formData);

        // Show success modal
        setModalMessage('Registration successful!');
        setModalType('success');
        setIsModalOpen(true);

        // Clear form data
        setFormData({
          name: '',
          email: '',
          password: '',
          role: '',
          agreeToTerms: false,
        });

        console.log('Signup successful:', response.data);
      } catch (error) {
        console.error('Signup failed:', error.response?.data || error.message);

        // Show error modal
        if (error.response?.data.message) {
          setModalMessage(error.response.data.message);
        } else {
          setModalMessage('An error occurred during signup. Please try again.');
        }
        setModalType('error');
        setIsModalOpen(true);
      }
    }
  };

  // Close the modal and redirect to the landing page
  const closeModal = () => {
    setIsModalOpen(false);
    navigate('/login'); // Redirect to the landing page
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <label>Name</label>
        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        {errors.name && <span className="error">{errors.name}</span>}
        <hr className="hr-line" />

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

        {/* Role */}
        <label>Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Select Role</option>
          <option value="fleet_manager">Fleet Manager</option>
          <option value="driver">Driver</option>
          <option value="maintenance_team">Maintenance Team</option>
          <option value="finance_team">Finance Team</option>
          <option value="senior_management">Senior Management</option>
        </select>
        {errors.role && <span className="error">{errors.role}</span>}
        <hr className="hr-line" />

        {/* Agree to Terms and Conditions */}
        <div className="terms">
          <input
            type="checkbox"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            required
          />
          <label>I agree to the Terms and Conditions</label>
        </div>
        {errors.agreeToTerms && <span className="error">{errors.agreeToTerms}</span>}

        {/* Submit Button */}
        <input type="submit" value="Sign Up" className="submit-button" />
      </form>

      {/* Modal for success/error messages */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        message={modalMessage}
        type={modalType}
      />
    </div>
  );
}

export default Signup;