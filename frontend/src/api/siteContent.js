import api from './axios';

export async function fetchSiteContent() {
  const { data } = await api.get('/site-content');
  return data;
}
