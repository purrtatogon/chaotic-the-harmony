import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Client components
import ClientLoginPage from './pages/Client/ClientLoginPage';
import HomePage from './pages/Client/HomePage';
import AdminLoginPage from './pages/Admin/AdminLoginPage';
// Admin components
import DashboardLayout from './pages/Admin/DashboardLayout';
import DashboardPage from './pages/Admin/DashboardPage';

function App() {
  const isAuthenticated = true; 
  const isAdmin = true;        

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<ClientLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* PROTECTED ADMIN ROUTES */}
        <Route 
          path="/admin" 
          element={
            isAuthenticated && isAdmin ? <DashboardLayout /> : <Navigate to="/admin/login" replace />
          }
        >
           <Route index element={<DashboardPage />} />
           {/* Future Children: The Layout stays, only this part changes */}
           {/* <Route path="products" element={<ProductsPage />} /> */}
           {/* <Route path="users" element={<UsersPage />} /> */}
        </Route>

        <Route path="*" element={<h1>404: Whoopsy daisy! Page Not Found.</h1>} />
      </Routes>
    </Router>
  );
}

export default App;