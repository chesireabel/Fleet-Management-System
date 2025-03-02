import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css'; 

const API_URL = import.meta.env.VITE_API_URL;

const Maintenance = () => {
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({
    vehicle: '',
    serviceType: '',
    serviceDate: '',
    nextServiceDate: '',
    serviceCenter: '',
    cost: '',
    notes: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [filterVehicle, setFilterVehicle] = useState('');

  // Load records from localStorage on component mount
  useEffect(() => {
    const savedRecords = JSON.parse(localStorage.getItem('maintenanceRecords')) || [];
    setRecords(savedRecords);
  }, []);

  // Save records to localStorage whenever records change
  useEffect(() => {
    localStorage.setItem('maintenanceRecords', JSON.stringify(records));
  }, [records]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (new Date(formData.nextServiceDate) <= new Date(formData.serviceDate)) {
      alert('Next service date must be after the service date.');
      return;
    }
    if (editingRecord) {
      setRecords(records.map(record => record.id === editingRecord ? { ...formData, id: editingRecord } : record));
      setEditingRecord(null);
    } else {
      const newRecord = { ...formData, id: Date.now() };
      setRecords([...records, newRecord]);
    }
    setFormData({ vehicle: '', serviceType: '', serviceDate: '', nextServiceDate: '', serviceCenter: '', cost: '', notes: '' });
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setRecords(records.filter(record => record.id !== id));
  };

  const handleEdit = (record) => {
    setFormData(record);
    setEditingRecord(record.id);
    setShowModal(true);
  };

  const filteredRecords = filterVehicle
    ? records.filter(record => record.vehicle.toLowerCase().includes(filterVehicle.toLowerCase()))
    : records;

  return (
    <div className="container mt-5">
      <h1 className="text-center">Maintenance Records</h1>
      
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Filter by vehicle"
          value={filterVehicle}
          onChange={(e) => setFilterVehicle(e.target.value)}
        />
      </div>
      
      <button className="btn bg-primary mb-3 text-white" onClick={() => setShowModal(true)}>Add Maintenance</button>
      
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingRecord ? 'Edit Maintenance Record' : 'Add Maintenance Record'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="row">
              {Object.keys(formData).map((key, index) => (
                <div className="col-md-6" key={key}>
                  <div className="mb-3">
                    <label htmlFor={key} className="form-label">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                    <input
                      type={key.includes('Date') ? 'date' : key === 'cost' ? 'number' : 'text'}
                      className="form-control"
                      id={key}
                      name={key}
                      value={formData[key]}
                      onChange={handleChange}
                      required={key !== 'nextServiceDate' && key !== 'notes'}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-3">
              <button type="submit" className="btn bg-primary text-white">Save</button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Service Type</th>
            <th>Service Date</th>
            <th>Next Service Date</th>
            <th>Service Center</th>
            <th>Cost</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.map((record) => (
            <tr key={record.id}>
              {Object.values(record).map((value, i) => (
                <td key={i}>{value}</td>
              ))}
              <td>
                <button className='btn btn-warning btn-sm me-2' onClick={() => handleEdit(record)}>Edit</button>
                <button className='btn btn-danger btn-sm' onClick={() => handleDelete(record.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Maintenance;