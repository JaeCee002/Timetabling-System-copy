import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './components/sidebar';
import MyCalendar from './components/myCalendar';
import AdminDashboard from './components/dash';
import { Modal, Button } from 'react-bootstrap';
import "./App.css";
import { AuthProvider } from './components/AuthContext';
import UserCalendar from "./components/userCalendar";
import LoginPage from "./components/loginPage";
import AdminCalendar from "./components/adminCalendar";
import ProtectedRoute from './components/protectedRoutes';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";


 


function App() { 

  return (
     <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/adminCalendar" element={
            <ProtectedRoute requiredRole="admin">
              <AdminCalendar />
            </ProtectedRoute>
        } />
        <Route path="/dash" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
        } />
        <Route path="/userCalendar" element={
            <ProtectedRoute requiredRole="user">
              <UserCalendar />
            </ProtectedRoute>
        } />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;