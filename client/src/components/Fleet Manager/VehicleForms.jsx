import React, { useState } from "react";

const VehicleForm = ({ vehicle, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    registrationNumber: vehicle?.registrationNumber || "",
    make: vehicle?.make || "",
    model: vehicle?.model || "",
    year: vehicle?.year || "",
    vehicleType: vehicle?.vehicleType || "",
    fuelType: vehicle?.fuelType || "",
    odometerReading: vehicle?.odometerReading || "",
    insuranceDetails: {
      policyNumber: vehicle?.insuranceDetails?.policyNumber || "",
      insuranceProvider: vehicle?.insuranceDetails?.insuranceProvider || "",
      expiryDate: vehicle?.insuranceDetails?.expiryDate || "",
    },
    vehicleHealth: vehicle?.vehicleHealth || "Good",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("insurance.")) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        insuranceDetails: { ...prev.insuranceDetails, [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      year: Number(formData.year),
      odometerReading: Number(formData.odometerReading),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
      {/* Row 1 - Basic Information */}
      <div className="row g-4">
        <div className="col-md-6">
          <label className="form-label fw-medium">Registration Number</label>
          <input
            type="text"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label fw-medium">Make</label>
          <input
            type="text"
            name="make"
            value={formData.make}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
      </div>

      {/* Row 2 - Model Information */}
      <div className="row g-4">
        <div className="col-md-6">
          <label className="form-label fw-medium">Model</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label fw-medium">Year</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="form-control"
            min="1900"
            max={new Date().getFullYear() + 1}
            required
          />
        </div>
      </div>

      {/* Row 3 - Specifications */}
      <div className="row g-4">
        <div className="col-md-3">
          <label className="form-label fw-medium">Vehicle Type</label>
          <select
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">Select Type</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Truck">Truck</option>
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label fw-medium">Fuel Type</label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">Select Fuel</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label fw-medium">Odometer (km)</label>
          <input
            type="number"
            name="odometerReading"
            value={formData.odometerReading}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="col-md-3">
          <label className="form-label fw-medium">Vehicle Health</label>
          <select
            name="vehicleHealth"
            value={formData.vehicleHealth}
            onChange={handleChange}
            className="form-select"
          >
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>
      </div>

      {/* Row 4 - Insurance Details */}
      <div className="row g-4">
        <div className="col-md-4">
          <label className="form-label fw-medium">Policy Number</label>
          <input
            type="text"
            name="insurance.policyNumber"
            value={formData.insuranceDetails.policyNumber}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-medium">Insurance Provider</label>
          <input
            type="text"
            name="insurance.insuranceProvider"
            value={formData.insuranceDetails.insuranceProvider}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-medium">Expiry Date</label>
          <input
            type="date"
            name="insurance.expiryDate"
            value={formData.insuranceDetails.expiryDate}
            onChange={handleChange}
            className="form-control"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="d-flex justify-content-end gap-2 pt-4 border-top">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary px-4"
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary px-4">
          {vehicle ? "Save Changes" : "Add Vehicle"}
        </button>
      </div>
    </form>
  );
};

export default VehicleForm; 