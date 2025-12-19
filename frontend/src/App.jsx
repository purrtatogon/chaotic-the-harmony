import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import ClientLoginPage from './pages/Client/ClientLoginPage';
import HomePage from './pages/Client/HomePage';

import AdminLoginPage from './pages/Admin/AdminLoginPage';
import DashboardLayout from './pages/Admin/DashboardLayout';

function App() {
  // placeholder auth logic for now
  const isAuthenticated = true; 
  const isAdmin = true;        

  return (
    <Router>
      <Routes>
        {/* --- PUBLIC CLIENT ROUTES --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<ClientLoginPage />} />

        {/* --- PUBLIC ADMIN ROUTE --- */}
        {/* Dedicated portal for staff to sign in */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* --- PROTECTED ADMIN ROUTES --- */}
        <Route 
          path="/admin" 
          element={
            // Logic: If logged in AND is admin, show dashboard.
            // If not, redirect explicitly to the ADMIN login page.
            isAuthenticated && isAdmin ? <DashboardLayout /> : <Navigate to="/admin/login" replace />
          }
        >
           {/* Nested Admin Pages */}
           <Route index element={<h2>Dashboard Overview</h2>} />
           {/* You will add products, categories, users routes here later */}
        </Route>

        {/* --- 404 CATCH-ALL --- */}
        <Route path="*" element={<h1>404: Whoopsy daisy, Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;