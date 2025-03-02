import React, { useState,useEffect, useCallback } from "react";
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
    const openModals = document.querySelectorAll('.modal.show');
    openModals.forEach(modal => {
      const modalInstance = bootstrap.Modal.getInstance(modal);
      if (modalInstance) {
        modalInstance.hide(); // Use Bootstrap's hide method
      } else {
        // Fallback for modals initialized via data attributes
        bootstrap.Modal.getOrCreateInstance(modal).hide();
      }
    });
  };

  // Updated component change handler
  const handleComponentChange = (component) => {
    closeBootstrapModal();
    setActiveComponent(component);
  };

  // Sidebar links (top section)
  const topLinks = [
    { key: "Dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { key: "Vehicles", label: "Vehicles", icon: <FaCar /> },
    { key: "TrackVehicles", label: "Track Vehicles", icon: <SiGooglemaps /> },
    { key: "Drivers", label: "Drivers", icon: <FaUser /> },
    { key: "Maintenance", label: "Maintenance", icon: <FaWrench /> },
    { key: "Reports", label: "Reports", icon: <FaChartLine /> },
    
  ];

  // Sidebar links (bottom section)
  const bottomLinks = [
    { key: "Settings", label: "Settings", icon: <FaCog /> },
    { key: "Profile", label: "Profile", icon: <FaUser /> },
  ];

  // Render the active component
  const renderComponent = useCallback(() => {
    switch (activeComponent) {
      case "Dashboard":
        return <Dashboard />;
        case "Vehicles":
        return <Vehicles />;
      case "TrackVehicles":
        return <VehicleTracker />;
      case "Drivers":
        return <Drivers/>
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

  return (
    <div className="d-flex" style={{ margin: 0, padding: 0 ,width:"100vw",minHeight:"100vh",overflow:"hidden"}}>
      {/* Sidebar (Left) */}
      <div
        className="bg-dark text-white p-3 border-end shadow-lg d-flex flex-column position-fixed vh-100"
        style={{ width: "200px", position: "fixed", left: 0, top: 0 ,zIndex:1050 }}
      >
        {/* Top Section */}
        <div>
          <h2 className="h4 text-center mb-4 text-white">Manager Panel</h2>
          <ul className="list-unstyled">
            {topLinks.map((link) => (
              <li key={link.key} className="mb-2">
                <button
                  onClick={() => handleComponentChange(link.key)}
                 
                  className={`btn w-100 btn-block text-left d-flex align-items-center text-start ${
                    activeComponent === link.key ? "btn-primary" : "btn-dark"
                  }`}
                  style={{
                    width: "100%",
                    transition: "all 0.3s ease",
                    borderRadius: "5px",
                    padding: "10px",
                  }}
                  aria-label={link.label}
                  aria-current={activeComponent === link.key ? "page" : undefined}
                >
                  <span style={{marginRight: "12px"}}>{link.icon}</span>
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto">
          <ul className="list-unstyled">
            {bottomLinks.map((link) => (
              <li key={link.key} className="mb-2">
                <button
                  onClick={() => handleComponentChange(link.key)}
                  className={`btn w-100 btn-block text-left d-flex align-items-center text-start ${
                    activeComponent === link.key ? "btn-primary" : "btn-dark"
                  }`}
                  style={{
                    width: "100%",
                    transition: "all 0.3s ease",
                    borderRadius: "5px",
                    padding: "10px",
                  }}
                  aria-label={link.label}
                  aria-current={activeComponent === link.key ? "page" : undefined}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-3 " style={{ marginLeft:" 200px", width: "calc(100% - 200px)" }}>
         {/* Render Active Component */}
        {renderComponent()}
      </div>
    </div>
  );
};

export default ManagerSidebar;