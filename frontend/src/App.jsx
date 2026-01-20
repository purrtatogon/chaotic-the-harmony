import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Customer components
import CustomerLayout from './layouts/CustomerLayout';
import CustomerLoginPage from './pages/Customer/CustomerLoginPage';
import SignUpPage from './pages/Customer/SignUpPage';
import HomePage from './pages/Customer/HomePage';
import StorePage from './pages/Customer/StorePage/index.jsx';
import CollectionPage from './pages/Customer/StorePage/CollectionPage.jsx';
import AboutPage from './pages/Customer/AboutPage';
import ShippingPage from './pages/Customer/ShippingPage';
import FAQPage from './pages/Customer/FAQPage';
import CustomerProductDetailPage from './pages/Customer/ProductDetailPage';
import CartPage from './pages/Customer/CartPage';
import CustomerProfilePage from './pages/Customer/ProfilePage';
import CheckoutShippingPage from './pages/Customer/CheckoutShippingPage';
import CheckoutPaymentPage from './pages/Customer/CheckoutPaymentPage';
import CheckoutSuccessPage from './pages/Customer/CheckoutSuccessPage';
// Admin components
import AdminLoginPage from './pages/Admin/AdminLoginPage';
import AdminDashboardLayout from './components/Admin/AdminDashboardLayout';
import DashboardPage from './pages/Admin/DashboardPage';
import UserListPage from './pages/Admin/UserListPage';
import UserDetailPage from './pages/Admin/UserDetailPage';
import UserFormPage from './pages/Admin/UserFormPage';
import ProfilePage from './pages/Admin/ProfilePage';
import ProductListPage from './pages/Admin/ProductListPage';
import ProductDetailPage from './pages/Admin/ProductDetailPage';
import ProductFormPage from './pages/Admin/ProductFormPage';
import OrderListPage from './pages/Admin/OrderListPage';
import OrderDetailPage from './pages/Admin/OrderDetailPage';
import WarehouseListPage from './pages/Admin/WarehouseListPage';
import WarehouseDetailPage from './pages/Admin/WarehouseDetailPage';
import SiteContentListPage from './pages/Admin/SiteContentListPage';
import SiteContentEditPage from './pages/Admin/SiteContentEditPage';
import DemoBanner from './components/Global/DemoBanner.jsx';
import RouteAnnouncer from './components/Global/RouteAnnouncer/RouteAnnouncer.jsx';
import { useAdminAuth } from './contexts/AuthContext.jsx';

// Lightweight placeholder routes until IA ships real pages.

const ComingSoon = ({ title }) => (
  <div className="comingSoonPage">
    <h1 className="comingSoonHeading">{title}</h1>
    <p className="comingSoonBody">This page is coming soon. Check back later!</p>
    <a href="/" className="comingSoonLink">Return to home</a>
  </div>
);

const AdminRoutes = () => {
  const { isAuthenticated, isAdmin } = useAdminAuth();
  return isAuthenticated && isAdmin ? (
    <AdminDashboardLayout />
  ) : (
    <Navigate to="/admin/login" replace />
  );
};

const NotFoundPage = () => (
  <main id="main-content" tabIndex={-1} className="notFoundPage">
    <h1>404 — Page not found</h1>
    <p className="notFoundBody">
      <a href="/" className="notFoundLink">Return to home</a>
    </p>
  </main>
);

function App() {
  return (
    <Router>
      <RouteAnnouncer />
      <DemoBanner />
      <Routes>
        {/* Customer storefront — uses CustomerLayout (theme + MegaNav) */}
        <Route element={<CustomerLayout />}>
          <Route path="/"              element={<HomePage />} />
          <Route path="/about"         element={<AboutPage />} />
          <Route path="/shipping"      element={<ShippingPage />} />
          <Route path="/faq"           element={<FAQPage />} />
          <Route path="/products/:id"  element={<CustomerProductDetailPage />} />
          <Route path="/login"         element={<CustomerLoginPage />} />
          <Route path="/signup"        element={<SignUpPage />} />

          {/* Store sub-home + era collection pages */}
          <Route path="/store"                        element={<StorePage />} />
          <Route path="/store/collection/:theme"      element={<CollectionPage />} />

          {/* Music section home + sub-pages */}
          <Route path="/music"         element={<ComingSoon title="Music" />} />
          <Route path="/music/albums"  element={<ComingSoon title="Albums" />} />
          <Route path="/music/eps"     element={<ComingSoon title="EPs" />} />

          {/* About extras */}
          <Route path="/tour"          element={<ComingSoon title="Tour Dates" />} />
          <Route path="/news"          element={<ComingSoon title="Latest News" />} />

          {/* Media section home + sub-pages */}
          <Route path="/media"         element={<ComingSoon title="Media" />} />
          <Route path="/media/videos"  element={<ComingSoon title="Videos" />} />
          <Route path="/media/pics"    element={<ComingSoon title="Pics" />} />

          {/* Cart & Checkout */}
          <Route path="/cart"                element={<CartPage />} />
          <Route path="/checkout/shipping"   element={<CheckoutShippingPage />} />
          <Route path="/checkout/payment"    element={<CheckoutPaymentPage />} />
          <Route path="/checkout/success"    element={<CheckoutSuccessPage />} />

          {/* Profile */}
          <Route path="/profile"       element={<CustomerProfilePage />} />

          {/* Wishlist — now handled inside /profile tab, redirect there */}
          <Route path="/wishlist"      element={<CustomerProfilePage />} />
        </Route>

        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected admin routes */}
        <Route path="/admin" element={<AdminRoutes />}>
          <Route index                       element={<DashboardPage />} />
          <Route path="users"                element={<UserListPage />} />
          <Route path="users/me"             element={<ProfilePage />} />
          <Route path="users/:id/edit"       element={<UserFormPage />} />
          <Route path="users/:id"            element={<UserDetailPage />} />
          <Route path="products"             element={<ProductListPage />} />
          <Route path="products/new"         element={<ProductFormPage />} />
          <Route path="products/:id"         element={<ProductDetailPage />} />
          <Route path="products/:id/edit"    element={<ProductFormPage />} />
          <Route path="orders"               element={<OrderListPage />} />
          <Route path="orders/:orderSlug"    element={<OrderDetailPage />} />
          <Route path="warehouses"           element={<WarehouseListPage />} />
          <Route path="warehouses/:zoneName" element={<WarehouseDetailPage />} />
          <Route path="site-content/:groupSlug" element={<SiteContentListPage />} />
          <Route path="site-content"           element={<SiteContentListPage />} />
          <Route path="site-content/edit/:id"  element={<SiteContentEditPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
