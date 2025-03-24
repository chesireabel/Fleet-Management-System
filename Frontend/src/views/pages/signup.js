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

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('success');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = 'First name cannot exceed 50 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length > 50) {
      newErrors.lastName = 'Last name cannot exceed 50 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post('http://localhost:3000/users/register', {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });

        setModalMessage('Registration successful! Please login.');
        setModalType('success');
        setIsModalOpen(true);

        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: '',
          agreeToTerms: false,
        });

      } catch (error) {
        const errorMessage = error.response?.data?.message || 'An error occurred during signup. Please try again.';
        setModalMessage(errorMessage);
        setModalType('error');
        setIsModalOpen(true);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (modalType === 'success') {
      navigate('/login');
    }
  };

  return (
    <CContainer className="d-flex align-items-center justify-content-center vh-100">
      <CCard style={{ width: '500px' }}>
        <CCardBody>
          <h2 className="text-center mb-4">Sign Up</h2>
          <CForm onSubmit={handleSubmit}>
            {/* First Name */}
            <div className="mb-3">
              <CFormLabel>First Name</CFormLabel>
              <CFormInput
                type="text"
                name="firstName"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleChange}
                invalid={!!errors.firstName}
              />
              {errors.firstName && <CAlert color="danger">{errors.firstName}</CAlert>}
            </div>

            {/* Last Name */}
            <div className="mb-3">
              <CFormLabel>Last Name</CFormLabel>
              <CFormInput
                type="text"
                name="lastName"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleChange}
                invalid={!!errors.lastName}
              />
              {errors.lastName && <CAlert color="danger">{errors.lastName}</CAlert>}
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

            {/* Terms Checkbox */}
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

            <div className="d-grid">
              <CButton type="submit" color="primary">
                Sign Up
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>

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