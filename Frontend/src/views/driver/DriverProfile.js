import axios from 'axios';
import { useEffect, useState } from 'react';
import { 
  CCard, CCardBody, CCardHeader, CSpinner, CAlert, CButton, 
  CFormInput, CForm, CRow, CCol
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilSave } from '@coreui/icons';

const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = 'driverToken';

const DriverProfile = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // Auth check helper
  const checkAuth = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    if (!token || !userData) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('userData');
      window.location.href = '/login';
      return false;
    }
    return true;
  };

  const fetchProfile = async (signal) => {
    if (!checkAuth()) return;

    const token = localStorage.getItem(TOKEN_KEY);
    const userData = JSON.parse(localStorage.getItem('userData'));

    try {
      const response = await axios.get(`${API_URL}/users/${userData.id}`, {
        signal,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Role': 'driver' 
        }
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
        if (error.response?.status === 401) checkAuth();
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
    if (!checkAuth()) return;

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userData = JSON.parse(localStorage.getItem('userData'));

      const response = await axios.patch(
        `${API_URL}/users/${userData.id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Role': 'driver'
          }
        }
      );

      // Update local storage if email changes
      if (response.data.email !== userData.email) {
        localStorage.setItem('userData', JSON.stringify({
          ...userData,
          email: response.data.email
        }));
      }

      setUser(response.data);
      setIsEditing(false);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      if (error.response?.status === 401) checkAuth();
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
    <CCard className="shadow" style={{ 
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '0'
    }}>
      <CCardHeader 
        className="d-flex justify-content-between align-items-center bg-primary text-white py-3"
        style={{ flexShrink: 0 }}
      >
        <h2 className="mb-0 fs-4">Driver Profile</h2>
        <CButton 
          color="light" 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="text-primary py-2"
          disabled={isLoading}
        >
          <CIcon icon={isEditing ? cilSave : cilPencil} className="me-2" />
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </CButton>
      </CCardHeader>
      
      <CCardBody style={{ 
        overflow: 'hidden',
        flex: 1,
        padding: '1.5rem',
        position: 'relative'
      }}>
        <div style={{
          height: '100%',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <CForm 
            onSubmit={(e) => { e.preventDefault(); handleSave(); }}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ 
              flex: 1,
              overflow: 'hidden',
              paddingRight: '15px'
            }}>
              <CRow className="g-3">
                <CCol md={6}>
                  <div className="mb-3">
                    <label className="form-label text-muted small">First Name</label>
                    {isEditing ? (
                      <CFormInput 
                        name="firstName" 
                        value={formData.firstName || ''} 
                        onChange={handleInputChange} 
                        className="border-primary"
                        required
                      />
                    ) : (
                      <div className="fs-5 text-dark">{user.firstName}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small">Last Name</label>
                    {isEditing ? (
                      <CFormInput 
                        name="lastName" 
                        value={formData.lastName || ''} 
                        onChange={handleInputChange}
                        className="border-primary"
                        required
                      />
                    ) : (
                      <div className="fs-5 text-dark">{user.lastName}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small">Email</label>
                    {isEditing ? (
                      <CFormInput 
                        type="email" 
                        name="email" 
                        value={formData.email || ''} 
                        onChange={handleInputChange}
                        className="border-primary"
                        required
                      />
                    ) : (
                      <div className="fs-5 text-dark">{user.email}</div>
                    )}
                  </div>
                </CCol>

                <CCol md={6}>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Driver ID</label>
                    <div className="fs-5 text-muted">{user.id}</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small">License Expiry</label>
                    {isEditing ? (
                      <CFormInput 
                        type="date" 
                        name="licenseExpiry" 
                        value={formData.licenseExpiry?.split('T')[0] || ''} 
                        onChange={handleInputChange}
                        className="border-primary"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    ) : (
                      <div className="fs-5 text-dark">
                        {new Date(user.licenseExpiry).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CCol>
              </CRow>
            </div>

            {isEditing && (
              <div className="border-top pt-3 mt-3" style={{ flexShrink: 0 }}>
                <div className="d-flex justify-content-end gap-2">
                  <CButton 
                    color="secondary" 
                    onClick={() => setIsEditing(false)}
                    className="px-4"
                  >
                    Cancel
                  </CButton>
                  <CButton 
                    color="primary" 
                    type="submit"
                    className="px-4"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <CSpinner size="sm" />
                    ) : (
                      <>
                        <CIcon icon={cilSave} className="me-2" /> 
                        Save Changes
                      </>
                    )}
                  </CButton>
                </div>
              </div>
            )}
          </CForm>
        </div>
      </CCardBody>
    </CCard>
  );
};

export default DriverProfile;