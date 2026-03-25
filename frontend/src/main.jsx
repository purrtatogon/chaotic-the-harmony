import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Import theme CSS files FIRST so variables are available globally
import './styles/themes/admin.css'
import './styles/themes/customer.css'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { CartProvider } from './contexts/CartContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
