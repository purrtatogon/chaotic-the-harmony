import axios from 'axios';

const api = axios.create({
    baseURL: 'https://chaotic-the-harmony-api.azurewebsites.net/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically add the token to every request if we have one
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;