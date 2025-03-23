import { useState } from 'react';
import { 
  CForm, CFormLabel, CFormInput, CFormSelect,
  CFormTextarea, CButton, CAlert, CCol, CRow,
  CCard, CCardBody, CCardHeader
} from '@coreui/react';
import { cilWarning,  cilUser, cilMap, cilDescription } from '@coreui/icons';
import CIcon from '@coreui/icons-react';

const IncidentReportForm = () => {
  const [formData, setFormData] = useState({
    type: '',
    severity: 'Medium',
    vehicle: '',
    driver: '',
    location: '',
    description: '',
  });
  const [submissionStatus, setSubmissionStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/incident-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportData: {
            incidents: [{
              ...formData,
              resolved: false,
              ...(formData.driver && { driver: formData.driver })
            }]
          }
        })
      });

      if (!response.ok) throw new Error('Submission failed');
      
      setSubmissionStatus('success');
      setFormData({
        type: '',
        severity: 'Medium',
        vehicle: '',
        driver: '',
        location: '',
        description: '',
      });
      
    } catch (error) {
      console.error('Error reporting incident:', error);
      setSubmissionStatus('error');
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <CCard className="shadow-sm mx-auto" style={{ maxWidth: '800px' }}>
      <CCardHeader className="bg-danger text-white py-3">
        <h5 className="mb-0 d-flex align-items-center">
          <CIcon icon={cilWarning} className="me-2" />
          New Incident Report
        </h5>
      </CCardHeader>
      
      <CCardBody>
        <CForm onSubmit={handleSubmit} className="gap-3">
          {/* Status Alerts */}
          {submissionStatus === 'success' && (
            <CAlert color="success" dismissible className="mb-4" onClose={() => setSubmissionStatus(null)}>
              Incident reported successfully!
            </CAlert>
          )}
          {submissionStatus === 'error' && (
            <CAlert color="danger" dismissible className="mb-4" onClose={() => setSubmissionStatus(null)}>
              Failed to submit incident. Please try again.
            </CAlert>
          )}

          {/* Incident Type & Severity */}
          <CRow className="g-3 mb-4">
            <CCol md={6}>
              <div className="form-group">
                <CFormLabel className="fw-bold small text-uppercase text-secondary">
                  <CIcon icon={cilWarning} className="me-1" />
                  Incident Type*
                </CFormLabel>
                <CFormSelect 
                  value={formData.type}
                  onChange={handleChange('type')}
                  className="form-select-lg"
                  required
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
              <div className="form-group">
                <CFormLabel className="fw-bold small text-uppercase text-secondary">
                  Severity Level*
                </CFormLabel>
                <CFormSelect
                  value={formData.severity}
                  onChange={handleChange('severity')}
                  className="form-select-lg"
                  required
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </CFormSelect>
              </div>
            </CCol>
          </CRow>

          {/* Vehicle & Driver Inputs */}
          <div className="border-top border-bottom py-4 mb-4">
            <CRow className="g-3">
              <CCol md={6}>
                <div className="form-group">
                  <CFormLabel className="fw-bold small text-uppercase text-secondary">
                    <CIcon  className="me-1" />
                    Vehicle Identification*
                  </CFormLabel>
                  <CFormInput
                    value={formData.vehicle}
                    onChange={handleChange('vehicle')}
                    placeholder="Enter vehicle "
                    className="form-control-lg"
                    required
                  />
                </div>
              </CCol>
              
              <CCol md={6}>
                <div className="form-group">
                  <CFormLabel className="fw-bold small text-uppercase text-secondary">
                    <CIcon icon={cilUser} className="me-1" />
                    Driver Identification (Optional)
                  </CFormLabel>
                  <CFormInput
                    value={formData.driver}
                    onChange={handleChange('driver')}
                    placeholder="Enter driver ID"
                    className="form-control-lg"
                  />
                </div>
              </CCol>
            </CRow>
          </div>

          {/* Location & Description */}
          <div className="mb-4">
            <div className="form-group mb-4">
              <CFormLabel className="fw-bold small text-uppercase text-secondary">
                <CIcon icon={cilMap} className="me-1" />
                Incident Location*
              </CFormLabel>
              <CFormInput
                value={formData.location}
                onChange={handleChange('location')}
                placeholder="Enter precise location (e.g., GPS coordinates, landmark)"
                className="form-control-lg"
                required
              />
            </div>

            <div className="form-group">
              <CFormLabel className="fw-bold small text-uppercase text-secondary">
                <CIcon icon={cilDescription} className="me-1" />
                Incident Details*
              </CFormLabel>
              <CFormTextarea
                value={formData.description}
                onChange={handleChange('description')}
                rows="5"
                placeholder="Provide complete incident details including: 
- Date and time of occurrence
- Vehicles/people involved
- Environmental conditions
- Immediate actions taken"
                className="form-control-lg"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="d-grid mt-2">
            <CButton 
              color="danger" 
              type="submit"
              className="py-2 fw-bold text-white"
            >
              Submit Incident Report
            </CButton>
          </div>
        </CForm>
      </CCardBody>
    </CCard>
  );
};

export default IncidentReportForm;