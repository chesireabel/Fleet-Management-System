import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CForm, 
  CFormLabel,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CButton,
  CAlert,
  CCol,
  CRow,
  CCard,
  CCardBody,
  CCardHeader,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CSpinner,
  CToaster,
  CToast,
  CToastHeader,
  CToastBody,
  CInputGroup,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem
} from '@coreui/react';
import { 
  cilWarning, 
  cilUser, 
  cilMap, 
  cilDescription, 
  cilPlus,
  cilCheckCircle,
  cilXCircle,
  cilFilter
} from '@coreui/icons';
import CIcon from '@coreui/icons-react';

const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = 'driverToken';

const IncidentReportForm = () => {
  const [incidents, setIncidents] = useState([]);
  const [formData, setFormData] = useState({
    type: '',
    severity: 'Medium',
    vehicle: '',
    location: '',
    description: '',
  });
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [filters, setFilters] = useState({
    searchTerm: '',
    type: 'all',
    severity: 'all',
    status: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  const checkAuthStatus = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('userData');
      window.location.href = '/login';
      return false;
    }
    
    return true;
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: e.target.value 
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!checkAuthStatus()) return;
      await fetchIncidents();
    };
    fetchData();
  }, []);

  const fetchIncidents = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await axios.get(`${API_URL}/incident-reports/driver-reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIncidents(response.data.data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setSubmissionStatus('error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkAuthStatus()) return;

    const requiredFields = ['type', 'vehicle', 'location', 'description'];
    if (requiredFields.some(field => !formData[field])) {
      setSubmissionStatus('validationError');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userData = JSON.parse(localStorage.getItem('userData'));

      const reportData = {
        ...formData,
        driverId: userData.id,
        driverName: `${userData.firstName} ${userData.lastName}`
      };

      const response = await axios.post(`${API_URL}/incident-reports`, reportData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if ([200, 201].includes(response.status)) {
        setSuccessMessage(`Incident reported for ${formData.vehicle} at ${formData.location}`);
        setSubmissionStatus('success');
        setFormData({
          type: '',
          severity: 'Medium',
          vehicle: '',
          location: '',
          description: '',
        });
        setVisibleModal(false);
        await fetchIncidents();
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error reporting incident:', error);
      setSubmissionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const toggleResolved = async (id, currentStatus) => {
    if (!checkAuthStatus()) return;
    
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      await axios.patch(`${API_URL}/incident-reports/${id}`, 
        { resolved: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchIncidents();
    } catch (error) {
      console.error('Error updating incident:', error);
      setSubmissionStatus('error');
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const searchLower = filters.searchTerm.toLowerCase();
    return (
      incident.vehicle.toLowerCase().includes(searchLower) &&
      (filters.type === 'all' || incident.type === filters.type) &&
      (filters.severity === 'all' || incident.severity === filters.severity) &&
      (filters.status === 'all' || 
       (filters.status === 'resolved' ? incident.resolved : !incident.resolved))
    );
  });

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      type: 'all',
      severity: 'all',
      status: 'all'
    });
  };

  return (
    <div className="container-fluid p-4">
      <CToaster position="top-right">
        {successMessage && (
          <CToast visible={!!successMessage} color="success" className="text-white">
            <CToastHeader closeButton>
              <CIcon icon={cilCheckCircle} className="me-2" />
              Success!
            </CToastHeader>
            <CToastBody>{successMessage}</CToastBody>
          </CToast>
        )}
      </CToaster>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 text-danger">
          <CIcon icon={cilWarning} className="me-3" />
          Incident Management
        </h2>
        <div className="d-flex gap-3">
          <CButton 
            color="primary" 
            onClick={() => setShowFilters(!showFilters)}
            className="mS-2 rounded-pill"
            variant="outline"
          >
            <CIcon icon={showFilters ? cilXCircle : cilFilter} className="me-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </CButton>

          <CButton 
            color="danger" 
            onClick={() => setVisibleModal(true)}
            className="d-flex align-items-center rounded-pill px-4 shadow-sm"
          >
            <CIcon icon={cilPlus} className="me-2" />
            New Incident Report
          </CButton>
        </div>
      </div>

      {submissionStatus === 'error' && (
        <CAlert color="danger" className="mb-4 animate-fade-in">
          <strong>Error!</strong> Unable to process your request. Please try again later.
        </CAlert>
      )}

      {showFilters && (
        <CCard className="mb-4 shadow-sm animate-fade-in">
          <CCardBody className="p-3">
            <CRow className="g-3 align-items-center">
              <CCol md={3}>
                <CInputGroup>
                  <CFormInput
                    placeholder="Search vehicles..."
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  />
                </CInputGroup>
              </CCol>

              <CCol md={2}>
                <CFormSelect
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="Accident">Accident</option>
                  <option value="MechanicalFailure">Mechanical Failure</option>
                  <option value="TrafficViolation">Traffic Violation</option>
                  <option value="Other">Other</option>
                </CFormSelect>
              </CCol>

              <CCol md={2}>
                <CFormSelect
                  value={filters.severity}
                  onChange={(e) => handleFilterChange('severity', e.target.value)}
                >
                  <option value="all">All Severities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </CFormSelect>
              </CCol>

              <CCol md={2}>
                <CFormSelect
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="resolved">Resolved</option>
                  <option value="pending">Pending</option>
                </CFormSelect>
              </CCol>

              <CCol md={3} className="text-end">
                <CButton 
                  color="light" 
                  onClick={clearFilters}
                  className="me-2"
                  disabled={filters.searchTerm === '' && 
                           filters.type === 'all' && 
                           filters.severity === 'all' && 
                           filters.status === 'all'}
                >
                  Clear Filters
                </CButton>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )}

      <CCard className="shadow-lg border-0">
        <CCardHeader className="bg-danger text-white py-3">
          <h5 className="mb-0 d-flex align-items-center">
            <CIcon icon={cilWarning} className="me-2" />
            Recent Incident Reports
          </h5>
        </CCardHeader>
        <CCardBody className="p-0">
          <CTable hover responsive striped className="mb-0 table-hover">
            <CTableHead className="bg-light">
              <CTableRow>
                {['Type', 'Severity', 'Vehicle', 'Driver', 'Location', 'Status', 'Actions'].map((header, idx) => (
                  <CTableHeaderCell 
                    key={idx}
                    className="py-3 text-uppercase small font-weight-bold text-secondary"
                  >
                    {header}
                  </CTableHeaderCell>
                ))}
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredIncidents.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan="7" className="text-center py-4">
                    {incidents.length === 0 
                      ? 'No incidents reported yet' 
                      : 'No incidents match your filters'}
                  </CTableDataCell>
                </CTableRow>
              ) : (
                filteredIncidents.map((incident, index) => (
                  <CTableRow key={index} className="align-middle transition-hover">
                    <CTableDataCell className="font-weight-semi-bold">{incident.type}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge 
                        color={
                          incident.severity === 'High' ? 'danger' :
                          incident.severity === 'Medium' ? 'warning' : 'success'
                        }
                        className="rounded-pill py-2 px-3"
                      >
                        {incident.severity}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <span className="badge bg-light text-dark border">{incident.vehicle}</span>
                    </CTableDataCell>
                    <CTableDataCell>{incident.driverName || '—'}</CTableDataCell>
                    <CTableDataCell>
                      <div className="text-truncate" style={{ maxWidth: '200px' }} title={incident.location}>
                        {incident.location}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex align-items-center">
                        <div className={`status-indicator ${incident.resolved ? 'bg-success' : 'bg-secondary'}`} />
                        <CBadge 
                          color={incident.resolved ? 'success' : 'secondary'} 
                          className="rounded-pill ms-2"
                        >
                          {incident.resolved ? 'Resolved' : 'Pending'}
                        </CBadge>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CButton
                        color={incident.resolved ? 'secondary' : 'success'}
                        size="sm"
                        className="rounded-pill px-3 d-inline-flex align-items-center"
                        onClick={() => toggleResolved(incident.id, incident.resolved)}
                      >
                        <CIcon 
                          icon={incident.resolved ? cilXCircle : cilCheckCircle} 
                          className="me-1" 
                        />
                        {incident.resolved ? 'Re-open' : 'Resolve'}
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              )}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      <CModal 
        visible={visibleModal} 
        onClose={() => setVisibleModal(false)} 
        size="lg"
        backdrop="static"
        className="modal-enhance"
      >
        <CModalHeader closeButton className="bg-gradient-danger text-white">
          <CModalTitle className="d-flex align-items-center">
            <CIcon icon={cilWarning} className="me-2" />
            New Incident Report
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4">
          <CForm onSubmit={handleSubmit} className="gap-3">
            {submissionStatus === 'validationError' && (
              <CAlert color="warning" className="animate-shake">
                Please fill all required fields marked with *
              </CAlert>
            )}

            <CRow className="g-3 mb-4">
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel className="small text-secondary mb-1 required">
                    <CIcon icon={cilWarning} className="me-1" />
                    Incident Type *
                  </CFormLabel>
                  <CFormSelect 
                    value={formData.type}
                    onChange={handleChange('type')}
                    required
                    className="form-control"
                  >
                    <option value="">Select incident type</option>
                    <option value="Accident">Accident</option>
                    <option value="MechanicalFailure">Mechanical Failure</option>
                    <option value="TrafficViolation">Traffic Violation</option>
                    <option value="Other">Other</option>
                  </CFormSelect>
                </div>
              </CCol>

              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel className="small text-secondary mb-1 required">
                    Severity Level *
                  </CFormLabel>
                  <CFormSelect
                    value={formData.severity}
                    onChange={handleChange('severity')}
                    required
                    className="form-control"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </CFormSelect>
                </div>
              </CCol>
            </CRow>

            <CRow className="g-3 mb-4">
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel className="small text-secondary mb-1 required">
                    Vehicle Identification *
                  </CFormLabel>
                  <CFormInput
                    value={formData.vehicle}
                    onChange={handleChange('vehicle')}
                    required
                    className="form-control"
                    placeholder="Enter vehicle ID"
                  />
                </div>
              </CCol>
            </CRow>

            <div className="mb-4">
              <div className="mb-3">
                <CFormLabel className="small text-secondary mb-1 required">
                  <CIcon icon={cilMap} className="me-1" />
                  Incident Location *
                </CFormLabel>
                <CFormInput
                  value={formData.location}
                  onChange={handleChange('location')}
                  required
                  className="form-control"
                  placeholder="Enter location details"
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-3">
                <CFormLabel className="small text-secondary mb-1 required">
                  <CIcon icon={cilDescription} className="me-1" />
                  Incident Details *
                </CFormLabel>
                <CFormTextarea
                  value={formData.description}
                  onChange={handleChange('description')}
                  required
                  style={{ height: '120px' }}
                  className="form-control"
                  placeholder="Describe the incident in detail"
                />
              </div>
            </div>

            <div className="modal-footer justify-content-between pt-4 px-0 border-top">
              <CButton 
                color="light" 
                onClick={() => setVisibleModal(false)}
                className="rounded-pill px-4"
              >
                Cancel
              </CButton>
              <CButton 
                color="danger" 
                type="submit"
                className="rounded-pill px-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <CSpinner component="span" size="sm" aria-hidden="true" />
                    <span className="ms-2">Submitting...</span>
                  </>
                ) : 'Submit Report'}
              </CButton>
            </div>
          </CForm>
        </CModalBody>
      </CModal>

      <style>{`
        .status-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
        .animate-shake {
          animation: shake 0.5s;
        }
        .transition-hover {
          transition: all 0.2s ease;
        }
        .table-hover tbody tr:hover {
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .required:after {
          content: '*';
          color: #e55353;
          margin-left: 4px;
        }
        .modal-enhance {
          border-radius: 1rem;
        }
        .bg-gradient-danger {
          background: linear-gradient(45deg, #e55353, #d63939);
        }
      `}</style>
    </div>
  );
};

export default IncidentReportForm;