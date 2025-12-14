import api from './axios';

export const userApi = {

  // Fetch current user (My Profile)
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Admin: Get all users
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Admin: Get specific user
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Admin: Create new user
  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Admin: Update ANY user by ID
  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // 🆕 NEW: Update OWN profile (Name, Phone, Image)
  // This matches the @PutMapping("/profile") in UserController
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  // Change Password
  // Note: Ensure your backend has a matching endpoint for this, or it will 404.
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/users/password', { currentPassword, newPassword });
    return response.data;
  },

  // Admin: Delete user
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};