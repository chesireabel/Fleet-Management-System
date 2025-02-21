import React from 'react';
import '../styles/modal.css'; // Add styles for the modal

function Modal({ isOpen, onClose, message, type }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal ${type}`}>
        <h3>{type === 'success' ? 'Success!' : 'Error!'}</h3>
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default Modal;