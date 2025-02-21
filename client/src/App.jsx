import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing.jsx";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";

function App() {
  return (
  <Router>
    <Routes>
      <Route path="/" element={<LandingPage/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/signup" element={<Signup/>}/>
    </Routes>
  </Router>
  )
}
export default App
