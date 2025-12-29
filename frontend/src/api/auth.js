import api from './axios';

export const authApi = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userRole', response.data.role);
            // Save the email/username so it can be seen on the Dashboard
            localStorage.setItem('username', email); 
        }
        return response.data;
    },
    
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username'); // Clean up
        window.location.href = '/login';
    }
};