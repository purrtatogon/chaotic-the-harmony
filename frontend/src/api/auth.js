import api from './axios';

export const authApi = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        
        // Save the token and role to local storage
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userRole', response.data.role);
        }
        return response.data;
    },
    
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        window.location.href = '/login';
    }
};