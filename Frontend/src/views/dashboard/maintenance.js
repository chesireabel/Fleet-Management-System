import React, { useState, useEffect, useRef } from 'react';
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
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea
} from '@coreui/react';
import { cilPlus, cilPencil, cilTrash, cilChevronBottom, cilChevronTop, cilWarning } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { format, parseISO } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL;

const Maintenance = () => {
  const [state, setState] = useState({
    records: [],
    vehicles: [],
    loading: true,
    error: null,
    success: null,
    modalVisible: false,
    editingId: null,
    isSubmitting: false,
    expandedRecord: null,
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
    itemsPerPage: 10
  });

  const isMounted = useRef(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesRes, maintenanceRes] = await Promise.all([
          axios.get(`${API_URL}/vehicles`),
          axios.get(`${API_URL}/maintenance`, {
            params: {
              page: state.currentPage,
              limit: state.itemsPerPage
            }
          })
        ]);

        const vehiclesData = extractVehiclesData(vehiclesRes);
        const maintenanceData = extractMaintenanceData(maintenanceRes);

        if (isMounted.current) {
          setState(prev => ({
            ...prev,
            vehicles: Array.isArray(vehiclesData) ? vehiclesData : [],
            records: Array.isArray(maintenanceData.records) ? maintenanceData.records : [],
            totalPages: calculateTotalPages(maintenanceData.total),
            loading: false,
            error: null
          }));
        }
      } catch (error) {
        handleFetchError(error);
      }
    };

    isMounted.current = true;
    fetchData();
    return () => { isMounted.current = false; };
  }, [state.currentPage]);

  const extractVehiclesData = (response) => {
    try {
      const data = response?.data || {};
      return [
        ...(data.vehicles || []),
        ...(data.data || []),
        ...(data.items || []),
        ...(Array.isArray(data) ? data : [])
      ].filter(item => item?._id);
    } catch (error) {
      console.error('Vehicle data extraction failed:', error);
      return [];
    }
  };

  const extractMaintenanceData = (response) => {
    try {
      const data = response?.data || {};
      return {
        records: Array.isArray(data.records) ? data.records : 
                Array.isArray(data.data) ? data.data : [],
        total: data.total || data.count || 0
      };
    } catch (error) {
      console.error('Maintenance data extraction failed:', error);
      return { records: [], total: 0 };
    }
  };

  const calculateTotalPages = (total) => {
    return Math.ceil(total / state.itemsPerPage) || 1;
  };

  const handleFetchError = (error) => {
    console.error('API Error:', error);
    if (isMounted.current) {
      setState(prev => ({
        ...prev,
        error: error.response?.data?.message || 
             error.message || 
             'Failed to load data. Please try again later.',
        loading: false
      }));
    }
  };

  const getVehicleDetails = (vehicleId) => {
    return Array.isArray(state.vehicles) 
      ? state.vehicles.find(v => v?._id === vehicleId) || {}
      : {};
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: name === 'cost' ? Number(value) || 0 : value
      }
    }));
  };

  const validateForm = () => {
    const errors = [];
    const { vehicle, serviceDate, serviceType, cost } = state.formData;

    if (!vehicle) errors.push('Vehicle selection is required');
    if (!serviceDate) errors.push('Service date is required');
    if (!serviceType) errors.push('Service type is required');
    if (isNaN(cost) || cost <= 0) errors.push('Valid cost is required');
    
    if (state.formData.nextServiceDate) {
      const nextService = new Date(state.formData.nextServiceDate);
      const service = new Date(state.formData.serviceDate);
      if (nextService < service) {
        errors.push('Next service date cannot be before service date');
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (errors.length > 0) {
      setState(prev => ({ ...prev, error: errors.join('\n') }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isSubmitting: true, error: null }));

      const payload = {
        ...state.formData,
        serviceDate: new Date(state.formData.serviceDate).toISOString(),
        nextServiceDate: state.formData.nextServiceDate 
          ? new Date(state.formData.nextServiceDate).toISOString()
          : null,
        cost: parseFloat(state.formData.cost)
      };

      const method = state.editingId ? 'put' : 'post';
      const url = state.editingId 
        ? `${API_URL}/maintenance/${state.editingId}`
        : `${API_URL}/maintenance`;

      const response = await axios[method](url, payload);

      setState(prev => ({
        ...prev,
        records: state.editingId
          ? prev.records.map(r => r._id === response.data._id ? response.data : r)
          : [response.data, ...prev.records],
        modalVisible: false,
        editingId: null,
        formData: resetFormData(),
        success: state.editingId ? 'Record updated!' : 'Record created!',
        isSubmitting: false
      }));

      setTimeout(() => setState(prev => ({ ...prev, success: null })), 5000);
    } catch (error) {
      handleSubmissionError(error);
    }
  };

  const resetFormData = () => ({
    vehicle: '',
    serviceDate: '',
    serviceType: '',
    nextServiceDate: '',
    cost: '',
    serviceCenter: '',
    notes: ''
  });

  const handleSubmissionError = (error) => {
    console.error('Submission Error:', error);
    const serverError = error.response?.data;
    let errorMessage = 'An unexpected error occurred';

    if (serverError) {
      errorMessage = [
        serverError.message,
        ...(serverError.errors || []).map(e => `${e.path}: ${e.msg}`)
      ].filter(Boolean).join('\n');
    }

    setState(prev => ({
      ...prev,
      error: errorMessage,
      isSubmitting: false
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await axios.delete(`${API_URL}/maintenance/${id}`);
      
      setState(prev => ({
        ...prev,
        records: prev.records.filter(r => r._id !== id),
        success: 'Record deleted successfully!',
        loading: false
      }));
      
      setTimeout(() => setState(prev => ({ ...prev, success: null })), 5000);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.response?.data?.message || error.message,
        loading: false
      }));
    }
  };

  const renderVehicleOptions = () => {
    if (!Array.isArray(state.vehicles)) return null;
    return state.vehicles.map(vehicle => (
      <option key={vehicle?._id} value={vehicle?._id}>
        {vehicle?.make} {vehicle?.model} ({vehicle?.registrationNumber || 'No Reg'})
      </option>
    ));
  };

  const renderVehicleCell = (vehicleId) => {
    const vehicle = Array.isArray(state.vehicles) 
      ? state.vehicles.find(v => v?._id === vehicleId)
      : null;

    return (
      <>
        {vehicle?.make} {vehicle?.model}
        <div className="text-muted small">
          {vehicle?.registrationNumber || 'No registration'}
        </div>
      </>
    );
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <h5>Maintenance Records</h5>
            <CButton 
              color="primary"
              onClick={() => setState(prev => ({
                ...prev,
                modalVisible: true,
                editingId: null,
                formData: resetFormData()
              }))}
              disabled={!Array.isArray(state.vehicles) || state.vehicles.length === 0}
            >
              <CIcon icon={cilPlus} className="me-2" />
              Add Record
              {(!Array.isArray(state.vehicles) || state.vehicles.length === 0) && (
                <span className="ms-2 badge bg-danger">
                  {!Array.isArray(state.vehicles) ? 'Data Error' : 'No Vehicles'}
                </span>
              )}
            </CButton>
          </CCardHeader>

          <CCardBody>
            {state.error && (
              <div className="alert alert-danger mb-4">
                <CIcon icon={cilWarning} className="me-2" />
                {state.error}
              </div>
            )}

            {state.success && (
              <div className="alert alert-success mb-4">
                {state.success}
              </div>
            )}

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
                      <CTableHeaderCell>Service Type</CTableHeaderCell>
                      <CTableHeaderCell>Cost</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {Array.isArray(state.records) && state.records.length > 0 ? (
                      state.records.map(record => (
                        <React.Fragment key={record?._id}>
                          <CTableRow>
                            <CTableDataCell>
                              <CButton 
                                color="link"
                                onClick={() => setState(prev => ({
                                  ...prev,
                                  expandedRecord: prev.expandedRecord === record?._id 
                                    ? null 
                                    : record?._id
                                }))}
                              >
                                <CIcon icon={
                                  state.expandedRecord === record?._id 
                                    ? cilChevronTop 
                                    : cilChevronBottom
                                } />
                              </CButton>
                            </CTableDataCell>
                            <CTableDataCell>
                              {renderVehicleCell(record?.vehicle)}
                            </CTableDataCell>
                            <CTableDataCell>
                              {record?.serviceDate ? format(parseISO(record.serviceDate), 'MM/dd/yyyy') : 'N/A'}
                            </CTableDataCell>
                            <CTableDataCell>{record?.serviceType || 'N/A'}</CTableDataCell>
                            <CTableDataCell>
                              ${record?.cost?.toFixed(2) || '0.00'}
                            </CTableDataCell>
                            <CTableDataCell>
                              <CButton 
                                color="primary"
                                variant="outline"
                                size="sm"
                                className="me-2"
                                onClick={() => {
                                  const vehicleId = record?.vehicle?._id || record?.vehicle;
                                  setState(prev => ({
                                    ...prev,
                                    modalVisible: true,
                                    editingId: record?._id,
                                    formData: {
                                      vehicle: vehicleId,
                                      serviceDate: record?.serviceDate?.split('T')[0] || '',
                                      serviceType: record?.serviceType || '',
                                      nextServiceDate: record?.nextServiceDate?.split('T')[0] || '',
                                      cost: record?.cost || '',
                                      serviceCenter: record?.serviceCenter || '',
                                      notes: record?.notes || ''
                                    }
                                  }))
                                }}
                              >
                                <CIcon icon={cilPencil} />
                              </CButton>
                              <CButton
                                color="danger"
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(record?._id)}
                              >
                                <CIcon icon={cilTrash} />
                              </CButton>
                            </CTableDataCell>
                          </CTableRow>
                          {state.expandedRecord === record?._id && (
                            <CTableRow>
                              <CTableDataCell colSpan={6} className="p-0">
                                <div className="p-3 bg-light">
                                  <CRow>
                                    <CCol md={4}>
                                      <strong>Next Service:</strong>
                                      <div>
                                        {record?.nextServiceDate ? 
                                          format(parseISO(record.nextServiceDate), 'MM/dd/yyyy') : 
                                          'N/A'}
                                      </div>
                                    </CCol>
                                    <CCol md={4}>
                                      <strong>Service Center:</strong>
                                      <div>{record?.serviceCenter || 'N/A'}</div>
                                    </CCol>
                                    <CCol md={12} className="mt-3">
                                      <strong>Notes:</strong>
                                      <div>{record?.notes || 'No additional notes'}</div>
                                    </CCol>
                                  </CRow>
                                </div>
                              </CTableDataCell>
                            </CTableRow>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan={6} className="text-center py-4">
                          No maintenance records found
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>

                {state.totalPages > 1 && (
                  <CPagination className="mt-3">
                    {Array.from({ length: state.totalPages }, (_, i) => (
                      <CPaginationItem
                        key={i + 1}
                        active={i + 1 === state.currentPage}
                        onClick={() => setState(prev => ({
                          ...prev,
                          currentPage: i + 1
                        }))}
                      >
                        {i + 1}
                      </CPaginationItem>
                    ))}
                  </CPagination>
                )}
              </>
            )}
          </CCardBody>
        </CCard>

        <CModal 
          visible={state.modalVisible} 
          onClose={() => setState(prev => ({ ...prev, modalVisible: false }))}
          size="lg"
        >
          <CModalHeader closeButton>
            <CModalTitle>
              {state.editingId ? 'Edit Maintenance Record' : 'New Maintenance Record'}
            </CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm onSubmit={handleSubmit}>
              <CRow className="g-3">
                <CCol md={6}>
                  <CFormLabel>Select Vehicle</CFormLabel>
                  <CFormSelect
                    name="vehicle"
                    value={state.formData.vehicle}
                    onChange={handleInputChange}
                    required
                    disabled={!Array.isArray(state.vehicles) || state.vehicles.length === 0}
                  >
                    <option value="">Select a vehicle</option>
                    {renderVehicleOptions()}
                  </CFormSelect>
                  {(!Array.isArray(state.vehicles) || state.vehicles.length === 0) && (
                    <div className="text-danger mt-2">
                      <CIcon icon={cilWarning} className="me-2" />
                      {!Array.isArray(state.vehicles) 
                        ? 'Invalid vehicle data format' 
                        : 'No vehicles available'}
                    </div>
                  )}
                </CCol>

                <CCol md={6}>
                  <CFormLabel>Service Date</CFormLabel>
                  <CFormInput
                    type="date"
                    name="serviceDate"
                    value={state.formData.serviceDate}
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
                  <CFormLabel>Service Type</CFormLabel>
                  <CFormSelect
                    name="serviceType"
                    value={state.formData.serviceType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Service Type</option>
                    <option value="Oil Change">Oil Change</option>
                    <option value="Tire Replacement">Tire Replacement</option>
                    <option value="Brake Service">Brake Service</option>
                    <option value="General Maintenance">General Maintenance</option>
                  </CFormSelect>
                </CCol>

                <CCol md={6}>
                  <CFormLabel>Cost</CFormLabel>
                  <CFormInput
                    type="number"
                    step="0.01"
                    name="cost"
                    value={state.formData.cost}
                    onChange={handleInputChange}
                    required
                    min="0"
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
                    rows={3}
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
                      disabled={state.isSubmitting || !Array.isArray(state.vehicles) || state.vehicles.length === 0}
                    >
                      {state.isSubmitting ? (
                        <CSpinner size="sm" />
                      ) : state.editingId ? 'Update' : 'Create'}
                    </CButton>
                  </div>
                </CCol>
              </CRow>
            </CForm>
          </CModalBody>
        </CModal>
      </CCol>
    </CRow>
  );
};

export default Maintenance;