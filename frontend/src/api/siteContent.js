import api from './axios';

export async function fetchSiteContent() {
  const { data } = await api.get('/site-content');
  return data;
}

export async function fetchSiteContentById(id) {
  const { data } = await api.get(`/site-content/${id}`);
  return data;
}

export async function updateSiteContent(id, payload) {
  const { data } = await api.put(`/site-content/${id}`, payload);
  return data;
}
