import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import PropTypes from "prop-types";


const API_URL = import.meta.env.VITE_API_URL;

// 🔹 Date formatting utility
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date) ? "Invalid Date" : date.toLocaleDateString();
};

// 🔹 API service abstraction
const fetchDriversAPI = async () => {
  try {
    const response = await axios.get(` ${API_URL}/drivers` );
    console.log("API Response:", response.data);
    
  
    return response.data?.data?.drivers || [];
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch drivers. Please try again."
    );
  }
};

// 🔹 Driver row component for better readability
const DriverRow = ({ driver, index, expandedDriver, toggleDetails }) => (
  <React.Fragment>
    <tr>
      <td>{index + 1}</td>
      <td>{driver.firstName} {driver.lastName}</td>
      <td>{driver.licenseNumber}</td>
      <td>{driver.phone}</td>
      <td>{driver.email}</td>
      <td>
        <button
          className="btn btn-sm btn-outline-info me-2"
          onClick={() => toggleDetails(driver._id)}
          aria-expanded={expandedDriver === driver._id}
          aria-controls={`driver-details-${driver._id}`}
        >
          {expandedDriver === driver._id ? "Hide Details" : "View Details"}
        </button>
      </td>
    </tr>

    {expandedDriver === driver._id && (
      <tr>
        <td colSpan="6" id={`driver-details-${driver._id}`}>
          <div className="p-3 bg-light border rounded">
            <strong>Date of Birth:</strong> {formatDate(driver.dateOfBirth)}<br />
            <strong>Driving Score:</strong> {driver.drivingScore}<br />
            <strong>Status:</strong> {driver.activeStatus ? "Active" : "Inactive"}<br />
            <strong>Hire Date:</strong> {formatDate(driver.hireDate)}<br />
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
};

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedDriver, setExpandedDriver] = useState(null);

  // 🔹 Memoized fetch function with error handling
  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchDriversAPI();
      console.log("Fetched Drivers:", data);
      setDrivers(Array.isArray(data) ? data : []); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const toggleDetails = (id) => {
    setExpandedDriver(expandedDriver === id ? null : id);
  };

  return (
    <div className="container mt-4">
      <h2>Driver Management</h2>

      {/* Error Message with retry button */}
      {error && (
        <div className="alert alert-danger">
          {error}
          <button 
            onClick={fetchDrivers} 
            className="btn btn-link"
            aria-label="Retry loading drivers"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="d-flex justify-content-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Driver Table */}
      <div className="table-responsive mt-3">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>License Number</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && drivers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No drivers available.
                </td>
              </tr>
            ) : (
              drivers.map((driver, index) => (
                <DriverRow
                  key={driver._id}
                  driver={driver}
                  index={index}
                  expandedDriver={expandedDriver}
                  toggleDetails={toggleDetails}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Drivers;