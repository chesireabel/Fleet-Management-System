import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CSpinner,
  CPagination,
  CPaginationItem,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CAlert,
  CBadge,
  CCollapse
} from '@coreui/react';
import { cilPlus, cilPencil, cilTrash, cilChevronBottom, cilChevronTop, cilWarning } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { format, parseISO } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL;

const Maintenance = () => {
  const [state, setState] = useState({
    records: [],
    vehicles: [],
    serviceTypes: [],
    loading: true,
    error: null,
    success: null,
    modalVisible: false,
    editingRecord: null,
    isSubmitting: false,
    expandedRecord: null,
    deleteConfirmation: { show: false, recordId: null },
    formData: {
      vehicle: '',
      serviceDate: '',
      serviceType: '',
      nextServiceDate: '',
      cost: '',
      serviceCenter: '',
      notes: ''
    },
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10,
    searchTerm: ''
  });


  const isMounted = useRef(true);

  // Separate fetch function for vehicles
  const fetchVehicles = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/vehicles`);
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          vehicles: response.data.data.vehicles || [],
          error: null
        }));
      }
    } catch (error) {
      handleError(error, 'Failed to fetch vehicles');
    }
  }, []);
  
  // Separate fetch function for maintenance records
  const fetchMaintenance = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const response = await axios.get(`${API_URL}/maintenance`, {
        params: {
          
          page: state.currentPage,
          limit: state.itemsPerPage,
          search: state.searchTerm,
          populate: 'vehicle'
        }
      });
  
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          records: response.data.data || [],
          totalPages: Math.ceil((response.data?.total || 0) / state.itemsPerPage) || 1,
          loading: false,
          error: null
        }));
      }
    } catch (error) {
      handleError(error, 'Failed to fetch maintenance records');
    }
  }, [state.currentPage, state.itemsPerPage, state.searchTerm]);
  
  useEffect(() => {
    isMounted.current = true;
    
    // Initial load sequence
    const loadData = async () => {
      await fetchVehicles();
      await fetchMaintenance();
    };
    
    loadData();
    
    return () => { isMounted.current = false; };
  }, [fetchVehicles, fetchMaintenance]);
  
  // Separate effect for maintenance pagination/search changes
  useEffect(() => {
    if (isMounted.current) {
      fetchMaintenance();
    }
  }, [state.currentPage, state.itemsPerPage, state.searchTerm, fetchMaintenance]);
  
  // Error handling function
  const handleError = (error, defaultMessage) => {
    const message = error.response?.data?.message || error.message || defaultMessage;
    setState(prev => ({
      ...prev,
      error: message,
      loading: false,
      isSubmitting: false
    }));
  };
  const validateForm = () => {
    const errors = [];
    const { vehicle, serviceDate,nextServiceDate, serviceType, cost } = state.formData;

    if (!vehicle) errors.push('Vehicle selection is required');
    if (!serviceDate) errors.push('Service date is required');
    if (!serviceType) errors.push('Service type is required');
    if (isNaN(cost) || cost <= 0) errors.push('Valid cost is required');

    if (state.formData.nextServiceDate) {
      const nextService = new Date(state.formData.nextServiceDate);
      const service = new Date(state.formData.serviceDate);
      if (nextService < service) errors.push('Next service date cannot be before service date');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) return setState(prev => ({ ...prev, error: errors.join('\n') }));

    try {
      setState(prev => ({ ...prev, isSubmitting: true }));
      
      const payload = {
        ...state.formData,
        serviceDate: new Date(state.formData.serviceDate).toISOString(),
        nextServiceDate: state.formData.nextServiceDate 
          ? new Date(state.formData.nextServiceDate).toISOString()
          : null,
        cost: parseFloat(state.formData.cost)
      };

      const method = state.editingRecord ? 'put' : 'post';
      const url = state.editingRecord 
        ? `${API_URL}/maintenance/${state.editingRecord._id}`
        : `${API_URL}/maintenance`;

      const response = await axios[method](url, payload); // Store response      
      setState(prev => ({
        ...prev,
        modalVisible: false,
        success: state.editingRecord ? 'Record updated!' : 'Record created!',
        currentPage: state.editingRecord ? prev.currentPage : 1
      }));
      
      await fetchMaintenance();
        } catch (error) {
      handleError(error, 'Failed to save record');
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/maintenance/${state.deleteConfirmation.recordId}`);
      await fetchMaintenance();
      setState(prev => ({
        ...prev,
        records: prev.records.filter(r => r._id !== state.deleteConfirmation.recordId),
        success: response.data.message,
        deleteConfirmation: { show: false, recordId: null },
        isSubmitting:false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.response?.data?.error || "Failed to delete record",
        isSubmitting: false
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      formData: { 
        ...prev.formData, 
        [name]: name === 'cost' ? Number(value) : value 
      }
    }));
  };

  const filteredRecords = state.records.filter(record =>
    `${record.serviceCenter || ''} ${record.notes || ''} ${record.serviceType || ''}`
      .toLowerCase()
      .includes(state.searchTerm.toLowerCase())
  );

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <h5>Maintenance Records</h5>
            <div className="d-flex gap-3 align-items-center">
              <CFormInput
                placeholder="Search records..."
                value={state.searchTerm}
                onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                style={{ minWidth: '300px' }}
              />
              <CButton 
                color="primary"
                onClick={() => setState(prev => ({
                  ...prev,
                  modalVisible: true,
                  editingRecord: null,
                  formData: {
                    vehicle: '',
                    serviceDate: '',
                    serviceType: '',
                    nextServiceDate: '',
                    cost: '',
                    serviceCenter: '',
                    notes: ''
                  }
                }))}
              >
                <CIcon icon={cilPlus} className="me-2" />
                Add Record
              </CButton>
            </div>
          </CCardHeader>

          <CCardBody>
  {/* Error Alert - Visible in main interface */}
  {state.error && (
    <CAlert color="danger" className="mb-4" onClose={() => setState(prev => ({ ...prev, error: null }))} dismissible>
      <div className="d-flex align-items-center">
        <CIcon icon={cilWarning} className="me-2" />
        <div>
          {state.error.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>
    </CAlert>
  )}

  {/* Success Alert */}
  {state.success && (
    <CAlert color="success" className="mb-4" onClose={() => setState(prev => ({ ...prev, success: null }))} dismissible>
      {state.success}
    </CAlert>
  )}

            {state.success && <CAlert color="success">{state.success}</CAlert>}

            {state.loading ? (
              <div className="text-center py-4">
                <CSpinner color="primary" />
                <div className="mt-2">Loading maintenance records...</div>
              </div>
            ) : (
              <>
                <CTable hover responsive>
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell style={{ width: '40px' }} />
                      <CTableHeaderCell>Vehicle</CTableHeaderCell>
                      <CTableHeaderCell>Service Date</CTableHeaderCell>
                      <CTableHeaderCell>Type</CTableHeaderCell>
                      <CTableHeaderCell>Cost</CTableHeaderCell>
                      <CTableHeaderCell>Next Service</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredRecords.map(record => {
                      const vehicle = state.vehicles.find(v => v._id === record.vehicle) || {};
                      const isOverdue = record.nextServiceDate && 
                        new Date(record.nextServiceDate) < new Date();

                      return (
                        <React.Fragment key={record._id}>
                          <CTableRow>
                            <CTableDataCell>
                              <CButton 
                                color="link"
                                onClick={() => setState(prev => ({
                                  ...prev,
                                  expandedRecord: prev.expandedRecord === record._id ? null : record._id
                                }))}
                              >
                                <CIcon icon={state.expandedRecord === record._id ? cilChevronTop : cilChevronBottom} />
                              </CButton>
                            </CTableDataCell>
                            <CTableDataCell>
                            {record.vehicle?.registrationNumber || (
                             <span className="text-danger small">
                            <CIcon icon={cilWarning} /> Missing registration
                            </span>
  )}                            </CTableDataCell>
                            <CTableDataCell>
                              {format(parseISO(record.serviceDate), 'MM/dd/yyyy')}
                            </CTableDataCell>
                            <CTableDataCell>{record.serviceType}</CTableDataCell>
                            <CTableDataCell>{record.cost?.toFixed(2)}</CTableDataCell>
                            <CTableDataCell>
                              <CBadge color={isOverdue ? 'danger' : 'success'}>
                                {record.nextServiceDate 
                                  ? format(parseISO(record.nextServiceDate), 'MM/dd/yyyy')
                                  : 'N/A'}
                                {isOverdue && <CIcon icon={cilWarning} className="ms-2" />}
                              </CBadge>
                            </CTableDataCell>
                            <CTableDataCell>
                              <CButton
                                color="warning"
                                variant="outline"
                                size="sm"
                                className="me-2"
                                onClick={() => setState(prev => ({
                                  ...prev,
                                  modalVisible: true,
                                  editingRecord: record,
                                  formData: {
                                    ...record,
                                    serviceDate: record.serviceDate.split('T')[0],
                                    nextServiceDate: record.nextServiceDate?.split('T')[0] || '',
                                    vehicle: record.vehicle._id || record.vehicle
                                  }
                                }))}
                              >
                                <CIcon icon={cilPencil} />
                              </CButton>
                              <CButton
                                color="danger"
                                variant="outline"
                                size="sm"
                                onClick={() => setState(prev => ({
                                  ...prev,
                                  deleteConfirmation: { show: true, recordId: record._id }
                                }))}
                              >
                                <CIcon icon={cilTrash} />
                              </CButton>
                            </CTableDataCell>
                          </CTableRow>
                          <CTableRow>
                            <CTableDataCell colSpan={7} className="p-0">
                              <CCollapse visible={state.expandedRecord === record._id}>
                                <div className="p-3 bg-light">
                                  <CRow>
                                    <CCol md={4}>
                                      <strong>Service Center:</strong>
                                      <div>{record.serviceCenter || 'N/A'}</div>
                                    </CCol>
                                    <CCol md={4}>
                                      <strong>Odometer Reading:</strong>
                                      <div>{record.odometer || 'N/A'}</div>
                                    </CCol>
                                    <CCol md={4}>
                                      <strong>Technician:</strong>
                                      <div>{record.technician || 'N/A'}</div>
                                    </CCol>
                                    <CCol md={12} className="mt-3">
                                      <strong>Notes:</strong>
                                      <div className="text-muted">
                                        {record.notes || 'No additional notes'}
                                      </div>
                                    </CCol>
                                  </CRow>
                                </div>
                              </CCollapse>
                            </CTableDataCell>
                          </CTableRow>
                        </React.Fragment>
                      );
                    })}
                  </CTableBody>
                </CTable>

                <CPagination className="mt-4 justify-content-center">
                  <CPaginationItem 
                    disabled={state.currentPage === 1}
                    onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  >
                    Previous
                  </CPaginationItem>
                  {Array.from({ length: state.totalPages }, (_, i) => (
                    <CPaginationItem
                      key={i + 1}
                      active={i + 1 === state.currentPage}
                      onClick={() => setState(prev => ({ ...prev, currentPage: i + 1 }))}
                    >
                      {i + 1}
                    </CPaginationItem>
                  ))}
                  <CPaginationItem 
                    disabled={state.currentPage === state.totalPages}
                    onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  >
                    Next
                  </CPaginationItem>
                </CPagination>
              </>
            )}
          </CCardBody>
        </CCard>

        {/* Add/Edit Modal */}
        <CModal 
          visible={state.modalVisible} 
          onClose={() => setState(prev => ({ ...prev, modalVisible: false }))}
          size="lg"
        >
          <CModalHeader closeButton>
            <CModalTitle>{state.editingRecord ? 'Edit Maintenance Record' : 'New Maintenance Record'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm onSubmit={handleSubmit}>
              <CRow className="g-3">
                <CCol md={6}>
                  <CFormLabel>Vehicle <span className="text-danger">*</span></CFormLabel>
                  <CFormSelect
                    name="vehicle"
                    value={state.formData.vehicle}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Vehicle</option>
                    {state.vehicles.map(vehicle => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.registrationNumber}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol md={6}>
                  <CFormLabel>Service Date <span className="text-danger">*</span></CFormLabel>
                  <CFormInput
                    type="date"
                    name="serviceDate"
                    value={state.formData.serviceDate}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>

                <CCol md={6}>
                  <CFormLabel>Service Type <span className="text-danger">*</span></CFormLabel>
                  <CFormInput
                    name="serviceType"
                    value={state.formData.serviceType}
                    onChange={handleInputChange}
                    required
                  
                  />
                </CCol>

                <CCol md={6}>
                  <CFormLabel>Next Service Date</CFormLabel>
                  <CFormInput
                    type="date"
                    name="nextServiceDate"
                    value={state.formData.nextServiceDate}
                    onChange={handleInputChange}
                    min={state.formData.serviceDate}
                  />
                </CCol>

                <CCol md={6}>
                  <CFormLabel>Cost (KES) <span className="text-danger">*</span></CFormLabel>
                  <CFormInput
                    type="number"
                    step="0.01"
                    name="cost"
                    value={state.formData.cost}
                    onChange={handleInputChange}
                    required
                  />
                </CCol>

                <CCol md={6}>
                  <CFormLabel>Service Center</CFormLabel>
                  <CFormInput
                    type="text"
                    name="serviceCenter"
                    value={state.formData.serviceCenter}
                    onChange={handleInputChange}
                  />
                </CCol>

                <CCol md={12}>
                  <CFormLabel>Notes</CFormLabel>
                  <CFormTextarea
                    name="notes"
                    value={state.formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </CCol>

                <CCol md={12} className="mt-4">
                  <div className="d-flex justify-content-end gap-2">
                    <CButton 
                      color="secondary" 
                      onClick={() => setState(prev => ({ ...prev, modalVisible: false }))}
                    >
                      Cancel
                    </CButton>
                    <CButton 
                      color="primary" 
                      type="submit" 
                      disabled={state.isSubmitting}
                    >
                      {state.isSubmitting && <CSpinner size="sm" className="me-2" />}
                      {state.editingRecord ? 'Update Record' : 'Create Record'}
                    </CButton>
                  </div>
                </CCol>
              </CRow>
            </CForm>
          </CModalBody>
        </CModal>

        {/* Delete Confirmation Modal */}
        <CModal 
          visible={state.deleteConfirmation.show}
          onClose={() => setState(prev => ({ ...prev, deleteConfirmation: { show: false, recordId: null } }))}
        >
          <CModalHeader closeButton>
            <CModalTitle>Confirm Deletion</CModalTitle>
          </CModalHeader>
          <CModalBody>
           <p> Are you sure you want to delete this maintenance record? This action cannot be undone.</p>
            {state.deleteConfirmation.recordId && (
      <p className="text-muted small">
        Record ID: {state.deleteConfirmation.recordId}
      </p>
    )}
          </CModalBody>
          <CModalFooter>
            <CButton 
              color="secondary" 
              onClick={() => setState(prev => ({ ...prev, deleteConfirmation: { show: false, recordId: null }}))}
              disabled={state.isSubmitting}
            >
              Cancel
            </CButton>
            <CButton color="danger" onClick={handleDelete}  disabled={state.isSubmitting}>
            {state.isSubmitting ? <CSpinner size="sm" /> : 'Delete Permanently'}
                        </CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </CRow>
  );
};

export default Maintenance;