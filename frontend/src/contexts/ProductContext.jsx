import { createContext, useContext, useReducer, useCallback } from 'react';
import { productApi } from '../api/product';

const ProductContext = createContext(null);

// Cached storefront catalog + filters — grids hit this instead of ad-hoc fetches everywhere.
function productReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, products: action.payload, error: null };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'CLEAR_FILTERS':
      return { ...state, filters: {} };
    default:
      return state;
  }
}

const initialState = {
  products: [],
  loading: false,
  error: null,
  filters: {},
};

export const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, initialState);

  const fetchProducts = useCallback(async (filters = {}) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await productApi.getAll(filters);
      dispatch({ type: 'FETCH_SUCCESS', payload: data || [] });
      return data || [];
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message || 'Failed to load products' });
      return [];
    }
  }, []);

  const fetchProductById = useCallback(async (id) => {
    try {
      return await productApi.getById(id);
    } catch {
      return null;
    }
  }, []);

  const searchProducts = useCallback(async (query) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await productApi.search(query);
      dispatch({ type: 'FETCH_SUCCESS', payload: data || [] });
      return data || [];
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message || 'Search failed' });
      return [];
    }
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  const value = {
    products: state.products,
    loading: state.loading,
    error: state.error,
    filters: state.filters,
    fetchProducts,
    fetchProductById,
    searchProducts,
    setFilters,
    clearFilters,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used within ProductProvider');
  return ctx;
};
