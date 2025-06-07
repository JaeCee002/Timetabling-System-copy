import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './components/sidebar';
import MyCalendar from './components/myCalendar';
import AdminDashboard from './components/dash';
import { Modal, Button } from 'react-bootstrap';
import "./App.css";
import UserCalendar from "./components/userCalendar";
import LoginPage from "./components/loginPage";
import AdminCalendar from "./components/adminCalendar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


 


function App() {
  
 
 

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/adminCalendar" element={<AdminCalendar />} />
        <Route path="/userCalendar" element={<UserCalendar/>} />
        <Route path="/dash" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;