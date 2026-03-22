import { createContext, useContext, useReducer, useCallback } from 'react';
import { authApi } from '../api/auth';

export const AuthContext = createContext(null);

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

function getInitialState() {
  return {
    token: localStorage.getItem('token') || null,
    userRole: localStorage.getItem('userRole') || null,
    username: localStorage.getItem('username') || null,
  };
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, undefined, getInitialState);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    dispatch({
      type: 'LOGIN',
      payload: {
        token: data.token,
        userRole: data.role,
        username: data.fullName || email,
      },
    });
    return data;
  }, []);

  const register = useCallback(async (fullName, email, password) => {
    const data = await authApi.register(fullName, email, password);
    dispatch({
      type: 'LOGIN',
      payload: {
        token: data.token,
        userRole: data.role,
        username: fullName,
      },
    });
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    dispatch({ type: 'LOGOUT' });
  }, []);

  /* Spring Security returns authority strings with "ROLE_" prefix.
     Any non-customer staff role can access the admin dashboard. */
  const isAdmin = state.userRole
    ? state.userRole !== 'ROLE_CUSTOMER' && state.userRole !== 'CUSTOMER'
    : false;

  const value = {
    token: state.token,
    userRole: state.userRole,
    username: state.username,
    isAuthenticated: !!state.token,
    isAdmin,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
