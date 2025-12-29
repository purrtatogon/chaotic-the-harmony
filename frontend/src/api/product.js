import api from './axios';

// Helper to convert an object into a query string
const buildQueryString = (params) => {
  if (!params) return '';

  const query = new URLSearchParams();

  Object.keys(params).forEach(key => {
    
    // Only append valid values (skip null/undefined/empty strings)
    if (params[key] !== null && params[key] !== '' && params[key] !== undefined) {
      query.append(key, params[key]);
    }
  });

  const queryString = query.toString();

  return queryString ? `?${queryString}` : '';
};


export const productApi = {

  getAll: async (filters = {}) => {
    const queryString = buildQueryString(filters);
    const response = await api.get(`/products${queryString}`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getTypes: async () => {
    const response = await api.get('/products/types');
    return response.data;
  },


  // Method for specific direct search calls (if needed)
  search: async (query) => {
    const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};