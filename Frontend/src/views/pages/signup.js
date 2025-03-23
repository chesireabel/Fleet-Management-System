import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormCheck,
  CButton,
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react';

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
        setModalMessage('Registration successful! Please login.');
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

  // Close the modal and redirect to the login page
  const closeModal = () => {
    setIsModalOpen(false);
    if (modalType === 'success') {
      navigate('/login'); // Redirect to the login page after successful signup
    }
  };

  return (
    <CContainer className="d-flex align-items-center justify-content-center vh-100">
      <CCard style={{ width: '500px' }}>
        <CCardBody>
          <h2 className="text-center mb-4">Sign Up</h2>
          <CForm onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-3">
              <CFormLabel>Name</CFormLabel>
              <CFormInput
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                invalid={!!errors.name}
              />
              {errors.name && <CAlert color="danger">{errors.name}</CAlert>}
            </div>

            {/* Email */}
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
              {errors.email && <CAlert color="danger">{errors.email}</CAlert>}
            </div>

            {/* Password */}
            <div className="mb-3">
              <CFormLabel>Password</CFormLabel>
              <CFormInput
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                invalid={!!errors.password}
              />
              {errors.password && <CAlert color="danger">{errors.password}</CAlert>}
            </div>

            {/* Role */}
            <div className="mb-3">
              <CFormLabel>Role</CFormLabel>
              <CFormSelect
                name="role"
                value={formData.role}
                onChange={handleChange}
                invalid={!!errors.role}
              >
                <option value="" disabled>Select Role</option>
                <option value="fleet_manager">Fleet Manager</option>
                <option value="driver">Driver</option>
                <option value="maintenance_team">Maintenance Team</option>
                <option value="finance_team">Finance Team</option>
                <option value="senior_management">Senior Management</option>
              </CFormSelect>
              {errors.role && <CAlert color="danger">{errors.role}</CAlert>}
            </div>

            {/* Agree to Terms and Conditions */}
            <div className="mb-3">
              <CFormCheck
                type="checkbox"
                name="agreeToTerms"
                label="I agree to the Terms and Conditions"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                invalid={!!errors.agreeToTerms}
              />
              {errors.agreeToTerms && <CAlert color="danger">{errors.agreeToTerms}</CAlert>}
            </div>

            {/* Submit Button */}
            <div className="d-grid">
              <CButton type="submit" color="primary">
                Sign Up
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>

      {/* Modal for success/error messages */}
      <CModal visible={isModalOpen} onClose={closeModal}>
        <CModalHeader>
          <CModalTitle>{modalType === 'success' ? 'Success' : 'Error'}</CModalTitle>
        </CModalHeader>
        <CModalBody>{modalMessage}</CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={closeModal}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
}

export default Signup;