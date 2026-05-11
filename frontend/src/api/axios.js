import axios from 'axios';

const api = axios.create({
    // Vite replaces this at build time; Docker/CI pass the same var.
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    // Mirror AuthContext prefixes so both apps can coexist in one browser tab.
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const prefix = isAdmin ? 'admin_' : 'customer_';
    const token = localStorage.getItem(`${prefix}token`);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
