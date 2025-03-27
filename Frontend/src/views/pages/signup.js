import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <CContainer className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <CCard className="shadow-lg border-0" style={{ width: '500px', borderRadius: '15px' }}>
        <CCardBody className="p-5">
          <h2 className="text-center mb-4 text-primary">Create Your Account</h2>
          <CForm onSubmit={handleSubmit}>
            <div className="row">
              {/* First Name */}
              <div className="col-md-6 mb-3">
                <CFormLabel className="form-label">First Name</CFormLabel>
                <CFormInput
                  type="text"
                  name="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                />
                {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
              </div>

              {/* Last Name */}
              <div className="col-md-6 mb-3">
                <CFormLabel className="form-label">Last Name</CFormLabel>
                <CFormInput
                  type="text"
                  name="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                />
                {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
              </div>
            </div>

            {/* Email */}
            <div className="mb-3">
              <CFormLabel className="form-label">Email</CFormLabel>
              <CFormInput
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            {/* Password */}
            <div className="mb-3">
              <CFormLabel className="form-label">Password</CFormLabel>
              <div className="input-group">
                <CFormInput
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                />
                <button 
                  type="button" 
                  className="btn btn-outline-secondary" 
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                </button>
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>
              <small className="text-muted">Password must be at least 8 characters</small>
            </div>

            {/* Role */}
            <div className="mb-3">
              <CFormLabel className="form-label">Role</CFormLabel>
              <CFormSelect
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`form-select ${errors.role ? 'is-invalid' : ''}`}
              >
                <option value="" disabled>Select Role</option>
                <option value="fleet_manager">Fleet Manager</option>
                <option value="driver">Driver</option>
                <option value="maintenance_team">Maintenance Team</option>
                <option value="finance_team">Finance Team</option>
                <option value="senior_management">Senior Management</option>
              </CFormSelect>
              {errors.role && <div className="invalid-feedback">{errors.role}</div>}
            </div>

            {/* Terms Checkbox */}
            <div className="mb-3">
              <CFormCheck
                type="checkbox"
                name="agreeToTerms"
                label="I agree to the Terms and Conditions"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className={errors.agreeToTerms ? 'is-invalid' : ''}
              />
              {errors.agreeToTerms && <div className="invalid-feedback">{errors.agreeToTerms}</div>}
            </div>

            <div className="d-grid mt-4">
              <CButton type="submit" color="primary" className="py-2">
                Create Account
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