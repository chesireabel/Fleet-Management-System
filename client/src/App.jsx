import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; 
import './index.css'
import LandingPage from "./pages/landing.jsx";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";
import ManagerSidebar from "./components/Fleet Manager/ManagerSidebar.jsx";





function App() {
  return (
  <Router>
    <Routes>
      <Route path="/" element={<LandingPage/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/signup" element={<Signup/>}/>

      <Route
      path="/manager"
      element ={<ManagerSidebar/>}> 
      </Route>
    </Routes>
  </Router>
  )
}
export default App
