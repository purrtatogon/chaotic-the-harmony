import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Customer components
import CustomerLayout from './layouts/CustomerLayout';
import CustomerLoginPage from './pages/Customer/CustomerLoginPage';
import HomePage from './pages/Customer/HomePage';
import AboutPage from './pages/Customer/AboutPage';
import ShippingPage from './pages/Customer/ShippingPage';
import FAQPage from './pages/Customer/FAQPage';
import CustomerProductDetailPage from './pages/Customer/ProductDetailPage';
import AdminLoginPage from './pages/Admin/AdminLoginPage';
// Admin components
import DashboardLayout from './pages/Admin/DashboardLayout';
import DashboardPage from './pages/Admin/DashboardPage';
import UserListPage from './pages/Admin/UserListPage';
import UserDetailPage from './pages/Admin/UserDetailPage';
import ProfilePage from './pages/Admin/ProfilePage';
import ProductListPage from './pages/Admin/ProductListPage';
import ProductDetailPage from './pages/Admin/ProductDetailPage';
import ProductFormPage from './pages/Admin/ProductFormPage';
import OrderListPage from './pages/Admin/OrderListPage';
import OrderDetailPage from './pages/Admin/OrderDetailPage';
import WarehouseListPage from './pages/Admin/WarehouseListPage';
import WarehouseDetailPage from './pages/Admin/WarehouseDetailPage';

function App() {
  const isAuthenticated = true;
  const isAdmin = true;

  return (
    <Router>
      <Routes>
        {/* Customer storefront - uses Customer Theme (neo-brutalist) */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/products/:id" element={<CustomerProductDetailPage />} />
          <Route path="/login" element={<CustomerLoginPage />} />
        </Route>

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
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="products/:id/edit" element={<ProductFormPage />} />
          <Route path="orders" element={<OrderListPage />} />
          <Route path="orders/:orderSlug" element={<OrderDetailPage />} />
          <Route path="warehouses" element={<WarehouseListPage />} />
          <Route path="warehouses/:zoneName" element={<WarehouseDetailPage />} />
        </Route>

        <Route path="*" element={<h1>404: Whoopsy daisy! Page Not Found.</h1>} />
      </Routes>
    </Router>
  );
}

export default App;