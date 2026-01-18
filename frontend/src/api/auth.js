import api from './axios';

export const authApi = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userRole', response.data.role);
            
            const nameToDisplay = response.data.fullName || email;
            localStorage.setItem('username', nameToDisplay);
        }
        return response.data;
    },
    
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        window.location.href = '/login';
    }
};