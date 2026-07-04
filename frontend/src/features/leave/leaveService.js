import apiClient from '../../api/apiClient';
import { mockApplyLeave, mockGetLeaveMe } from '../../mocks/leaveMock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export async function applyLeave(data, userId) {
  if (USE_MOCK) {
    return mockApplyLeave(userId, data);
  }
  const response = await apiClient.post('/leave/apply', data);
  return response.data.data;
}

export async function getLeaveMe(userId) {
  if (USE_MOCK) {
    return mockGetLeaveMe(userId);
  }
  const response = await apiClient.get('/leave/my');
  return response.data.data;
}
