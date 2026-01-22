import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Import theme CSS files FIRST so variables are available globally
import './styles/themes/admin.css'
import './styles/themes/customer.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
