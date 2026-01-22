import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Customer components
import CustomerLoginPage from './pages/Customer/CustomerLoginPage';
import HomePage from './pages/Customer/HomePage';
import AdminLoginPage from './pages/Admin/AdminLoginPage';
// Admin components
import DashboardLayout from './pages/Admin/DashboardLayout';
import DashboardPage from './pages/Admin/DashboardPage';
import UserListPage from './pages/Admin/UserListPage';
import UserDetailPage from './pages/Admin/UserDetailPage';
import ProfilePage from './pages/Admin/ProfilePage';
import ProductListPage from './pages/Admin/ProductListPage';
import ProductDetailPage from './pages/Admin/ProductDetailPage';
import CategoryListPage from './pages/Admin/CategoryListPage';
import CategoryDetailPage from './pages/Admin/CategoryDetailPage';
import OrderListPage from './pages/Admin/OrderListPage';
import WarehouseListPage from './pages/Admin/WarehouseListPage';

function App() {
  const isAuthenticated = true; 
  const isAdmin = true;        

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<CustomerLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* PROTECTED ADMIN ROUTES */}
        <Route 
          path="/admin" 
          element={isAuthenticated && isAdmin ? <DashboardLayout /> : <Navigate to="/admin/login" replace />}
        >
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UserListPage />} />
          <Route path="users/:id" element={<UserDetailPage />} />
          <Route path="users/me" element={<ProfilePage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="categories" element={<CategoryListPage />} />
          <Route path="categories/:id" element={<CategoryDetailPage />} />       
          <Route path="orders" element={<OrderListPage />} />
          <Route path="warehouses" element={<WarehouseListPage />} />
        </Route>

        <Route path="*" element={<h1>404: Whoopsy daisy! Page Not Found.</h1>} />
      </Routes>
    </Router>
  );
}

export default App;