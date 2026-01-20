import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/themes/admin.css'
import './styles/themes/customer.css'
import './index.css'
import App from './App.jsx'
import { CustomerAuthProvider, AdminAuthProvider } from './contexts/AuthContext.jsx'
import { CartProvider } from './contexts/CartContext.jsx'
import { ProductProvider } from './contexts/ProductContext.jsx'
import { WishlistProvider } from './contexts/WishlistContext.jsx'

// AdminAuth on the outside keeps /admin paths resolving to the staff token in axios + useAuth fallback.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminAuthProvider>
      <CustomerAuthProvider>
        <ProductProvider>
          <CartProvider>
            <WishlistProvider>
              <App />
            </WishlistProvider>
          </CartProvider>
        </ProductProvider>
      </CustomerAuthProvider>
    </AdminAuthProvider>
  </StrictMode>,
)
