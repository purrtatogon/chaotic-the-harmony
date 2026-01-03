import { createContext, useContext, useReducer, useCallback } from 'react';
import { authApi } from '../api/auth';

// JWT + role live in separate localStorage prefixes so admin + storefront sessions never clobber each other.
const CUSTOMER_PREFIX = 'customer_';
const ADMIN_PREFIX = 'admin_';

function storageKeys(prefix) {
  return {
    token: `${prefix}token`,
    userRole: `${prefix}userRole`,
    username: `${prefix}username`,
    email: `${prefix}email`,
  };
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        token: action.payload.token,
        userRole: action.payload.userRole,
        username: action.payload.username,
      };
    case 'LOGOUT':
      return { token: null, userRole: null, username: null };
    default:
      return state;
  }
}

function getInitialState(prefix) {
  const keys = storageKeys(prefix);
  return {
    token: localStorage.getItem(keys.token) || null,
    userRole: localStorage.getItem(keys.userRole) || null,
    username: localStorage.getItem(keys.username) || null,
  };
}

function clearStorage(prefix) {
  const keys = storageKeys(prefix);
  localStorage.removeItem(keys.token);
  localStorage.removeItem(keys.userRole);
  localStorage.removeItem(keys.username);
  localStorage.removeItem(keys.email);
}

function isStaffRole(role) {
  return role && role !== 'ROLE_CUSTOMER' && role !== 'CUSTOMER';
}

// ─── Storefront ───
const CustomerAuthContext = createContext(null);

export const CustomerAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(
    authReducer,
    CUSTOMER_PREFIX,
    getInitialState,
  );

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password, CUSTOMER_PREFIX);
    if (isStaffRole(data.role)) {
      clearStorage(CUSTOMER_PREFIX);
      throw new Error('Staff accounts cannot sign in to the storefront. Please use the admin dashboard.');
    }
    dispatch({
      type: 'LOGIN',
      payload: { token: data.token, userRole: data.role, username: data.fullName || email },
    });
    return data;
  }, []);

  const register = useCallback(async (fullName, email, password) => {
    const data = await authApi.register(fullName, email, password, CUSTOMER_PREFIX);
    dispatch({
      type: 'LOGIN',
      payload: { token: data.token, userRole: data.role, username: fullName },
    });
    return data;
  }, []);

  const logout = useCallback(() => {
    clearStorage(CUSTOMER_PREFIX);
    dispatch({ type: 'LOGOUT' });
  }, []);

  const value = {
    token: state.token,
    userRole: state.userRole,
    username: state.username,
    isAuthenticated: !!state.token,
    isAdmin: false,
    isCustomer: true,
    login,
    register,
    logout,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return ctx;
};

// ─── Backline (admin) ───
const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(
    authReducer,
    ADMIN_PREFIX,
    getInitialState,
  );

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password, ADMIN_PREFIX);
    if (!isStaffRole(data.role)) {
      clearStorage(ADMIN_PREFIX);
      throw new Error('Customer accounts cannot access the admin dashboard. Please use the storefront.');
    }
    dispatch({
      type: 'LOGIN',
      payload: { token: data.token, userRole: data.role, username: data.fullName || email },
    });
    return data;
  }, []);

  const logout = useCallback(() => {
    clearStorage(ADMIN_PREFIX);
    dispatch({ type: 'LOGOUT' });
  }, []);

  const hydrateSession = useCallback(() => {
    const keys = storageKeys(ADMIN_PREFIX);
    const token = localStorage.getItem(keys.token);
    const userRole = localStorage.getItem(keys.userRole);
    const username = localStorage.getItem(keys.username);
    if (token) {
      dispatch({ type: 'LOGIN', payload: { token, userRole, username } });
    }
  }, []);

  const isAdmin = state.userRole ? isStaffRole(state.userRole) : false;

  const value = {
    token: state.token,
    userRole: state.userRole,
    username: state.username,
    isAuthenticated: !!state.token,
    isAdmin,
    isCustomer: false,
    login,
    logout,
    hydrateSession,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};

// Back-compat escape hatch for legacy screens still calling useAuth().
export const AuthContext = createContext(null);

export const useAuth = () => {
  const customerCtx = useContext(CustomerAuthContext);
  const adminCtx = useContext(AdminAuthContext);

  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    if (adminCtx) return adminCtx;
  }

  if (customerCtx) return customerCtx;
  if (adminCtx) return adminCtx;

  throw new Error('useAuth must be used within an AuthProvider');
};

export { CUSTOMER_PREFIX, ADMIN_PREFIX, storageKeys };
