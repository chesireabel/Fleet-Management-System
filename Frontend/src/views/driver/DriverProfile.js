import axios from 'axios';
import { useEffect, useState } from 'react';
import { 
  CCard, CCardBody, CCardHeader, CSpinner, CAlert, CButton, 
  CFormInput, CForm, CRow, CCol
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilSave } from '@coreui/icons';

const API_URL = import.meta.env.VITE_API_URL;

const DriverProfile = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchProfile = async (signal) => {
    const token = localStorage.getItem('token');
    const driverId = localStorage.getItem('driverId');

    if (!driverId || !token) {
      setError("Authentication error - please login again");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/users/${driverId}`, {
        signal,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.role !== 'driver') {
        throw new Error('Access restricted to driver accounts');
      }

      setUser(response.data);
      setFormData(response.data);
      setError(null);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError(error.response?.data?.message || error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const driverId = localStorage.getItem('driverId');

      const response = await axios.patch(`${API_URL}/users/${driverId}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setUser(response.data);
      setIsEditing(false);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchProfile(abortController.signal);
    return () => abortController.abort();
  }, []);

  if (isLoading) return (
    <div className="text-center my-5">
      <CSpinner color="primary" />
      <p>Loading driver profile...</p>
    </div>
  );

  if (error) return (
    <CAlert color="danger">
      <h5>Profile Error</h5>
      <p>{error}</p>
      <CButton color="primary" onClick={() => {
        setIsLoading(true);
        setError(null);
        fetchProfile();
      }}>
        Retry
      </CButton>
    </CAlert>
  );

  return (
    <CCard className="mb-4 shadow">
      <CCardHeader className="d-flex justify-content-between align-items-center bg-primary text-white">
        <h2 className="mb-0">Driver Profile</h2>
        <CButton color="light" onClick={() => setIsEditing(!isEditing)} className="text-primary">
          <CIcon icon={isEditing ? cilSave : cilPencil} className="me-2" />
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </CButton>
      </CCardHeader>
      
      <CCardBody>
        <CForm onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <CRow>
            <CCol md={6}>
              <div className="mb-4">
                <h5 className="border-bottom pb-2 mb-3">Personal Information</h5>

                <div className="mb-3">
                  <label className="form-label text-muted small">First Name</label>
                  {isEditing ? (
                    <CFormInput name="firstName" value={formData.firstName || ''} onChange={handleInputChange} required />
                  ) : (
                    <div className="fs-5">{user.firstName}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small">Last Name</label>
                  {isEditing ? (
                    <CFormInput name="lastName" value={formData.lastName || ''} onChange={handleInputChange} required />
                  ) : (
                    <div className="fs-5">{user.lastName}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small">Email</label>
                  {isEditing ? (
                    <CFormInput type="email" name="email" value={formData.email || ''} onChange={handleInputChange} required />
                  ) : (
                    <div className="fs-5">{user.email}</div>
                  )}
                </div>
              </div>
            </CCol>

            <CCol md={6}>
              <div className="mb-4">
                <h5 className="border-bottom pb-2 mb-3">Driver Details</h5>

                <div className="mb-3">
                  <label className="form-label text-muted small">Driver ID</label>
                  <div className="fs-5 text-muted">{user.driverId}</div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small">License Expiry</label>
                  {isEditing ? (
                    <CFormInput type="date" name="licenseExpiry" value={formData.licenseExpiry?.split('T')[0] || ''} onChange={handleInputChange} required />
                  ) : (
                    <div className="fs-5">{new Date(user.licenseExpiry).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            </CCol>
          </CRow>

          {isEditing && (
            <div className="text-end mt-4 border-top pt-3">
              <CButton color="secondary" className="me-2" onClick={() => setIsEditing(false)}>Cancel</CButton>
              <CButton color="primary" type="submit">
                <CIcon icon={cilSave} className="me-2" /> Save Changes
              </CButton>
            </div>
          )}
        </CForm>
      </CCardBody>
    </CCard>
  );
};

export default DriverProfile;
