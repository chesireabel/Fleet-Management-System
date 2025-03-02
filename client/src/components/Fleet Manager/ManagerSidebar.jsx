import React, { useState, useCallback } from "react";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Header from "../header.jsx";
import { FaTachometerAlt, FaCar, FaWrench, FaChartLine, FaCog, FaUser } from "react-icons/fa";
import { SiGooglemaps } from "react-icons/si";
import Dashboard from "./Dashboard.jsx";
import Vehicles from "./Vehicles.jsx";
import VehicleTracker from "./VehicleTracker.jsx";
import Drivers from "./Driver.jsx";
import Maintenance from "./Maintenance.jsx";
import Reports from "./Reports.jsx";

const ManagerSidebar = () => {
  const [activeComponent, setActiveComponent] = useState("Dashboard");

  const closeBootstrapModal = () => {
    const openModals = document.querySelectorAll(".modal.show");
    openModals.forEach((modal) => {
      const modalInstance = bootstrap.Modal.getInstance(modal);
      if (modalInstance) {
        modalInstance.hide();
      } else {
        bootstrap.Modal.getOrCreateInstance(modal).hide();
      }
    });
  };

  const handleComponentChange = (component) => {
    closeBootstrapModal();
    setActiveComponent(component);
  };

  const topLinks = [
    { key: "Dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { key: "Vehicles", label: "Vehicles", icon: <FaCar /> },
    { key: "TrackVehicles", label: "Track Vehicles", icon: <SiGooglemaps /> },
    { key: "Drivers", label: "Drivers", icon: <FaUser /> },
    { key: "Maintenance", label: "Maintenance", icon: <FaWrench /> },
    { key: "Reports", label: "Reports", icon: <FaChartLine /> },
  ];

  const bottomLinks = [
    { key: "Profile", label: "Profile", icon: <FaUser /> },
    { key: "Settings", label: "Settings", icon: <FaCog /> },
  ];

  const renderComponent = useCallback(() => {
    switch (activeComponent) {
      case "Dashboard":
        return <Dashboard />;
      case "Vehicles":
        return <Vehicles />;
      case "TrackVehicles":
        return <VehicleTracker />;
      case "Drivers":
        return <Drivers />;
      case "Maintenance":
        return <Maintenance />;
      case "Reports":
        return <Reports />;
      case "Settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  }, [activeComponent]);

  const renderLinks = (links) =>
    links.map((link) => (
      <li key={link.key} className="mb-2">
        <button
          onClick={() => handleComponentChange(link.key)}
          className={`btn w-100 d-flex align-items-center text-start ${
            activeComponent === link.key ? "btn-primary" : "btn-dark"
          }`}
          style={{ borderRadius: "5px", padding: "10px" }}
          aria-label={link.label}
        >
          <span style={{ marginRight: "12px" }}>{link.icon}</span>
          {link.label}
        </button>
      </li>
    ));

  return (
    <div className="d-flex" style={{ width: "100vw", minHeight: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <div
        className="bg-dark text-white p-3 border-end shadow-lg d-flex flex-column position-fixed vh-100"
        style={{ width: "200px", left: 0, top: 0, zIndex: 1050 }}
      >
        <h2 className="h4 text-center mb-4 text-white">Manager Panel</h2>
        <ul className="list-unstyled">{renderLinks(topLinks)}</ul>

        {/* Bottom Section */}
        <div className="mt-auto">
          <ul className="list-unstyled">{renderLinks(bottomLinks)}</ul>
        </div>
      </div>

      {/* Header */}
      <div style={{ marginLeft: "200px", width: "calc(100% - 200px)", position: "fixed", top: 0, zIndex: 1000 }}>
        <Header />
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-3" style={{ marginLeft: "200px", width: "calc(100% - 200px)", marginTop: "60px" }}>
        {renderComponent()}
      </div>
    </div>
  );
};

export default React.memo(ManagerSidebar);