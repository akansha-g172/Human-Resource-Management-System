import apiClient from '../../api/apiClient';
import { mockGetProfileMe, mockUpdateProfileMe } from '../../mocks/profileMock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export async function getProfileMe(userId) {
  if (USE_MOCK) {
    return mockGetProfileMe(userId);
  }
  const response = await apiClient.get('/profile/me');
  return response.data;
}

export async function updateProfileMe(data, userId) {
  if (USE_MOCK) {
    return mockUpdateProfileMe(userId, data);
  }
  const response = await apiClient.patch('/profile/me', data);
  return response.data;
}
