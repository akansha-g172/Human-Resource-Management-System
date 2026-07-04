import apiClient from '../../api/apiClient';
import { mockCheckIn, mockCheckOut, mockGetAttendanceMe } from '../../mocks/attendanceMock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export async function checkIn(userId) {
  if (USE_MOCK) {
    return mockCheckIn(userId);
  }
  const response = await apiClient.post('/attendance/checkin');
  return response.data.data;
}

export async function checkOut(userId) {
  if (USE_MOCK) {
    return mockCheckOut(userId);
  }
  const response = await apiClient.post('/attendance/checkout');
  return response.data.data;
}

export async function getAttendanceMe(userId, fromDate, toDate) {
  if (USE_MOCK) {
    return mockGetAttendanceMe(userId, fromDate, toDate);
  }
  
  // Format query params if provided
  let url = '/attendance/me';
  const params = [];
  if (fromDate) params.push(`from=${fromDate}`);
  if (toDate) params.push(`to=${toDate}`);
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }
  
  const response = await apiClient.get(url);
  return response.data.data;
}
