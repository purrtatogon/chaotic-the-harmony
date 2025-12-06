import api from './axios';

/** Auth writes prefixed keys to localStorage; contexts read them back after refresh. */
export const authApi = {
    login: async (email, password, storagePrefix = '') => {
        const response = await api.post('/auth/login', { email, password });

        if (response.data.token && storagePrefix) {
            localStorage.setItem(`${storagePrefix}token`, response.data.token);
            localStorage.setItem(`${storagePrefix}userRole`, response.data.role);
            const nameToDisplay = response.data.fullName || email;
            localStorage.setItem(`${storagePrefix}username`, nameToDisplay);
            localStorage.setItem(`${storagePrefix}email`, email);
        }
        return response.data;
    },

    register: async (fullName, email, password, storagePrefix = '') => {
        const response = await api.post('/auth/register', { fullName, email, password });

        if (response.data.token && storagePrefix) {
            localStorage.setItem(`${storagePrefix}token`, response.data.token);
            localStorage.setItem(`${storagePrefix}userRole`, response.data.role);
            localStorage.setItem(`${storagePrefix}username`, fullName);
            localStorage.setItem(`${storagePrefix}email`, email);
        }
        return response.data;
    },

    logout: (storagePrefix = '') => {
        if (storagePrefix) {
            localStorage.removeItem(`${storagePrefix}token`);
            localStorage.removeItem(`${storagePrefix}userRole`);
            localStorage.removeItem(`${storagePrefix}username`);
            localStorage.removeItem(`${storagePrefix}email`);
        }
    },
};
