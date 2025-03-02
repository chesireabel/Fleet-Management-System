import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { IoIosAddCircleOutline } from "react-icons/io";
import { MdEdit, MdDelete } from "react-icons/md";
import PropTypes from "prop-types";
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = import.meta.env.VITE_API_URL;

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return isNaN(date) ? "Invalid Date" : date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid Date";
  }
};

const fetchDriversAPI = async () => {
  try {
    const response = await axios.get(`${API_URL}/drivers`);
    return response.data?.data?.drivers || [];
  } catch (error) {
    console.error("API Error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch drivers. Please try again."
    );
  }
};

const DriverRow = ({ driver, index, expandedDriver, toggleDetails, onEdit, onDelete }) => (
  <React.Fragment>
    <tr>
      <td>{index + 1}</td>
      <td>
        {driver.profilePicture && (
          <img 
            src={`${API_URL}${driver.profilePicture}`}
            alt="Profile"
            className="rounded-circle me-2"
            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
          />
        )}
        {driver.firstName} {driver.lastName}
      </td>
      <td>{driver.licenseNumber}</td>
      <td>{driver.phone}</td>
      <td>{driver.email}</td>
      <td>
        <div className="btn-group">
          <button 
            className="btn btn-sm btn-outline-info border-0" 
            onClick={() => toggleDetails(driver._id)}
            aria-label={expandedDriver === driver._id ? "Hide details" : "Show details"}
          >
            {expandedDriver === driver._id ? "Hide" : "View Details"}
          </button>
          <button 
            className="btn btn-sm btn-outline-warning border-0" 
            onClick={() => onEdit(driver)}
            aria-label="Edit driver"
          >
            <MdEdit />
          </button>
          <button 
            className="btn btn-sm btn-outline-danger border-0" 
            onClick={() => onDelete(driver._id)}
            aria-label="Delete driver"
          >
            <MdDelete />
          </button>
        </div>
      </td>
    </tr>
    {expandedDriver === driver._id && (
      <tr>
        <td colSpan="6">
          <div className="p-3 bg-light border rounded">
            <div className="row">
              <div className="col-md-3">
                <strong>Date of Birth:</strong> {formatDate(driver.dateOfBirth)}
              </div>
              <div className="col-md-3">
                <strong>Driving Score:</strong> {driver.drivingScore}
              </div>
              <div className="col-md-3">
                <strong>Status:</strong> 
                <span className={`badge ${driver.activeStatus ? 'bg-success' : 'bg-danger'}`}>
                  {driver.activeStatus ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="col-md-3">
                <strong>Hire Date:</strong> {formatDate(driver.hireDate)}
              </div>
            </div>
          </div>
        </td>
      </tr>
    )}
  </React.Fragment>
);

DriverRow.propTypes = {
  driver: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  expandedDriver: PropTypes.string,
  toggleDetails: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const Drivers = () => {
  const [state, setState] = useState({
    drivers: [],
    loading: false,
    error: "",
    successMessage: "",
    expandedDriver: null,
    modalOpen: false,
    editingDriver: null,
    formData: {
      profilePicture: "",
      firstName: "",
      lastName: "",
      licenseNumber: "",
      phone: "",
      email: "",
      dateOfBirth: "",
      drivingScore: 0,
      activeStatus: true,
      hireDate: new Date().toISOString().split('T')[0],
    }
  });

  const [searchTerm, setSearchTerm] = useState("");
  const isMounted = useRef(true);
  const abortControllers = useRef(new Map());

  const fetchDrivers = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: "" }));
    try {
      const data = await fetchDriversAPI();
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          drivers: Array.isArray(data) ? data : [],
          loading: false
        }));
      }
    } catch (err) {
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          error: err.message,
          loading: false
        }));
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchDrivers();
    return () => {
      isMounted.current = false;
      abortControllers.current.forEach(controller => controller.abort());
      abortControllers.current.clear();
    };
  }, [fetchDrivers]);

  const handleEdit = (driver) => {
    setState(prev => ({
      ...prev,
      editingDriver: driver,
      formData: { 
        ...driver,
        profilePicture: driver.profilePicture || null
      },
      modalOpen: true
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this driver?")) return;

    const controller = new AbortController();
    abortControllers.current.set(id, controller);

    try {
      await axios.delete(`${API_URL}/drivers/${id}`, {
        signal: controller.signal
      });

      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          drivers: prev.drivers.filter(driver => driver._id !== id),
          error: "",
          successMessage: "Driver deleted successfully!"
        }));
      }
    } catch (error) {
      if (isMounted.current && !axios.isCancel(error)) {
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           "Failed to delete driver. Please try again.";
        
        setState(prev => ({
          ...prev,
          error: errorMessage,
          successMessage: ""
        }));
      }
    } finally {
      abortControllers.current.delete(id);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: type === 'file' 
          ? files[0] 
          : name === 'activeStatus' 
            ? e.target.checked 
            : value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const controller = new AbortController();
    
    try {
      setState(prev => ({ ...prev, error: "" }));
      const { editingDriver, formData: stateData } = state;
      const formData = new FormData();

      Object.entries(stateData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: controller.signal
      };

      const response = editingDriver 
        ? await axios.put(`${API_URL}/drivers/${editingDriver._id}`, formData, config)
        : await axios.post(`${API_URL}/drivers`, formData, config);

      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          drivers: editingDriver
            ? prev.drivers.map(d => d._id === response.data._id ? response.data : d)
            : [response.data, ...prev.drivers],
          modalOpen: false,
          editingDriver: null,
          formData: {
            firstName: "",
            lastName: "",
            licenseNumber: "",
            phone: "",
            email: "",
            dateOfBirth: "",
            drivingScore: 0,
            activeStatus: true,
            hireDate: new Date().toISOString().split('T')[0],
            profilePicture: null
          },
          successMessage: editingDriver ? "Driver updated!" : "Driver created!"
        }));
      }
    } catch (error) {
      if (isMounted.current && !axios.isCancel(error)) {
        setState(prev => ({
          ...prev,
          error: error.response?.data?.message || "Save failed. Please check unique fields."
        }));
      }
    }
  };

  const filteredDrivers = state.drivers.filter(driver =>
    `${driver.firstName} ${driver.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Drivers</h2>
        <button 
          className="btn bg-primary text-white"
          onClick={() => setState(prev => ({ 
            ...prev, 
            modalOpen: true, 
            editingDriver: null,
            formData: {
              ...prev.formData,
              profilePicture: null
            }
          }))}
        >
          <IoIosAddCircleOutline className="me-2" />
          Create Driver
        </button>
      </div>

      <div className="position-relative mb-3" style={{ width: "250px" }}>
        <div 
          className="position-absolute" 
          style={{ 
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            zIndex: 2
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        
        <input
          type="search"
          placeholder="Search drivers..."
          aria-label="Search drivers"
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            fontSize: "0.875rem",
            height: "36px",
            border: "1px solid #dee2e6",
            borderRadius: "20px",
            paddingLeft: "40px",
            paddingRight: "16px",
            backgroundColor: "#fff",
            transition: "all 0.2s ease",
            outline: "none"
          }}
          className="py-1"
        />
      </div>

      {state.error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {state.error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setState(prev => ({ ...prev, error: "" }))}
          ></button>
        </div>
      )}

      {state.successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {state.successMessage}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setState(prev => ({ ...prev, successMessage: "" }))}
          ></button>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>License</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.loading ? (
              <tr>
                <td colSpan="6" className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No drivers found
                </td>
              </tr>
            ) : (
              filteredDrivers.map((driver, index) => (
                <DriverRow
                  key={driver._id}
                  driver={driver}
                  index={index}
                  expandedDriver={state.expandedDriver}
                  toggleDetails={(id) => 
                    setState(prev => ({ 
                      ...prev, 
                      expandedDriver: prev.expandedDriver === id ? null : id 
                    }))
                  }
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {state.modalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  {state.editingDriver ? "Edit Driver" : "New Driver"}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setState(prev => ({ ...prev, modalOpen: false }))}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Profile Picture</label>
                      <input
                        type="file"
                        name="profilePicture"
                        onChange={handleInputChange}
                        className="form-control"
                        accept="image/*"
                        key={state.modalOpen ? 'file-input-reset' : 'file-input'}
                      />
                      {state.formData.profilePicture && (
                        <div className="mt-2">
                          <img
                            src={state.formData.profilePicture instanceof File 
                              ? URL.createObjectURL(state.formData.profilePicture) 
                              : `${API_URL}${state.formData.profilePicture}`}
                            alt="Preview"
                            style={{ 
                              maxWidth: '200px', 
                              maxHeight: '200px',
                              borderRadius: '8px'
                            }}
                          />
                          <small className="d-block mt-1 text-muted">
                            {state.formData.profilePicture instanceof File 
                              ? state.formData.profilePicture.name 
                              : 'Current profile picture'}
                          </small>
                        </div>
                      )}
                    </div>

                    {/* Form fields for driver details */}
                    <div className="col-md-6">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={state.formData.firstName}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={state.formData.lastName}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                      />
                    </div>

                    
              <div className="col-md-6">
                <label className="form-label">License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={state.formData.licenseNumber}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={state.formData.phone}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={state.formData.email}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={state.formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Driving Score</label>
                <input
                  type="number"
                  name="drivingScore"
                  min="0"
                  max="100"
                  value={state.formData.drivingScore}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Hire Date</label>
                <input
                  type="date"
                  name="hireDate"
                  value={state.formData.hireDate}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6">
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    name="activeStatus"
                    checked={state.formData.activeStatus}
                    onChange={handleInputChange}
                    className="form-check-input"
                    role="switch"
                  />
                  <label className="form-check-label">Active Status</label>
                </div>
              </div>
            </div>

                  

                  <div className="modal-footer mt-4">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setState(prev => ({ ...prev, modalOpen: false }))}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {state.editingDriver ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;