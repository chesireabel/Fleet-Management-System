import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import VehicleForm from "./VehicleForms.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // ✅ Imported Bootstrap JS
import { IoAddCircleOutline } from "react-icons/io5";

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const modalEl = document.getElementById("vehicleModal");
    if (modalEl && !modalRef.current) {
      modalRef.current = new bootstrap.Modal(modalEl);
    }
  }, []);

  const fetchVehicles = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/vehicles/?page=${page}&limit=${limit}`);
      setVehicles(response.data.data.vehicles);
      setTotalPages(Math.ceil(response.data.total / limit));
      setError("");
    } catch (err) {
      setError(`Failed to fetch vehicles: ${err.response?.data?.message || err.message}`); // ✅ Improved error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles(currentPage);
  }, [currentPage]);

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedVehicle) {
        await axios.put(`/api/vehicles/${selectedVehicle._id}`, formData);
      } else {
        await axios.post("/api/vehicles/", formData);
      }
      modalRef.current.hide(); // ✅ Ensure modal hides properly
      await fetchVehicles(currentPage);
    } catch (err) {
      setError(`Failed to save vehicle: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDelete = async (vehicleId) => {
    try {
      await axios.delete(`/api/vehicles/${vehicleId}`);
      fetchVehicles(currentPage);
    } catch (err) {
      setError(`Failed to delete vehicle: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="container-fluid p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0">Vehicle Management</h2>
        <button
          className="btn bg-primary text-white btn-sm px-2 py-1" 
          onClick={() => {
            setSelectedVehicle(null);
            modalRef.current.show();
          }}
        >
          <IoAddCircleOutline className="me-1" /> Add New Vehicle
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

     
      {loading && (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {!loading && (
        <div className="table-responsive rounded-3 shadow-sm">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Registration</th>
                <th>Type</th>
                <th>Make</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle._id}>
                  <td>{vehicle.registrationNumber}</td>
                  <td>{vehicle.vehicleType}</td>
                  <td>{vehicle.make}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        modalRef.current.show();
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(vehicle._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    
      <nav className="mt-3">
        <ul className="pagination pagination-sm justify-content-start">
          {[...Array(totalPages)].map((_, i) => (
            <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))}
        </ul>
      </nav>

    
      <div className="modal fade" id="vehicleModal" tabIndex="-1">
        <div
          className="modal-dialog modal-dialog-centered"
          style={{
            maxWidth: "95%",
            minWidth: "80%",
            margin: "0 auto",
          }}
        >
          <div className="modal-content rounded-4 border-0 shadow-lg">
            <div className="modal-header bg-primary text-white rounded-top-4 p-3">
              <h5 className="modal-title mb-0 fs-4">
                {selectedVehicle ? "Edit Vehicle" : "New Vehicle"}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                onClick={() => modalRef.current.hide()} 
              ></button>
            </div>
            <div className="modal-body p-4" style={{ maxHeight: "80vh", overflowY: "auto" }}>
              <VehicleForm
                vehicle={selectedVehicle}
                onSubmit={handleFormSubmit}
                onCancel={() => modalRef.current.hide()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vehicles;
