import api from './axios';

export const orderApi = {
  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  getByCustomer: async (userId) => {
    const response = await api.get(`/orders/customer/${userId}`);
    return response.data;
  }
};
