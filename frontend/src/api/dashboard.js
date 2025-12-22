import api from './axios';

export const dashboardApi = {
    getStats: async () => {
        const response = await api.get('/dashboard/stats');
        return response.data;
    },
    getRecentActivity: async () => {
        const response = await api.get('/dashboard/activity');
        return response.data;
    }
};