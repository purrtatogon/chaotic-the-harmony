import axios from 'axios';

// VITE_API_URL is fixed at build time (see .env.* / Docker ARG). Fallback = deployed API.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'https://chaotic-the-harmony-api.azurewebsites.net/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
