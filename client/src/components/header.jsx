import React from "react";
import PropTypes from "prop-types";
import { Container, Form, Nav, Navbar, InputGroup } from "react-bootstrap";
import { Search } from "lucide-react";
import CompanyLogo from "../assets/Azul Automóvil Familiar Ilustración Transporte PNG ,dibujos  Familiar, Azul, Transporte PNG y PSD para Descargar Gratis _ Pngtree.jpeg";


const Header = ({ onSearch }) => {
  return (
    <Navbar
      bg="white"
      expand="lg"
      className="shadow-sm"
      style={{
        height: "60px",
        padding: "0 10px", // Add horizontal padding here
      }}
    >
      {/* Logo with zero spacing */}
      <Navbar.Brand 
        className="p-0" 
        style={{ 
          margin: 0,
          padding: 0,
          lineHeight: 0 // Remove spacing around image
        }}
      >
        <img
          src={CompanyLogo}
          alt="Company Logo"
          width="60"
          height="60"
          className="rounded-circle"
          style={{ display: "block" }} // Remove image inherent spacing
        />
      </Navbar.Brand>

      {/* Search Bar - Directly adjacent */}
      <Nav 
        className="flex-grow-1" 
        style={{ 
          marginLeft: "4px", // Minimal 4px spacing
          padding: 0 
        }}
      >
        <InputGroup 
          style={{ 
            borderRadius: "20px",
            border: "1px solid #000",
            height: "38px",
            maxWidth: "600px"
          }}
        >
          <InputGroup.Text 
            className="bg-white border-0" 
            style={{ 
              padding: "0 12px",
              borderTopLeftRadius: "20px",
              borderBottomLeftRadius: "20px"
            }}
          >
            <Search size={16} className="text-muted" />
          </InputGroup.Text>
          
          <Form.Control
            type="search"
            placeholder="Search"
            aria-label="Search"
            onChange={(e) => onSearch(e.target.value)}
            className="border-0"
            style={{
              fontSize: "0.875rem",
              padding: "0 8px",
              backgroundColor: "transparent",
            }}
          />
        </InputGroup>
      </Nav>
    </Navbar>
  );
};

Header.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default Header;