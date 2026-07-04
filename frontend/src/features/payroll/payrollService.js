import apiClient from '../../api/apiClient';
import * as payrollMock from '../../mocks/payrollMock';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export async function getMyPayroll(userId) {
  if (useMock) {
    return payrollMock.mockGetMyPayroll(userId);
  }
  const response = await apiClient.get('/payroll/me');
  return response.data;
}

export async function getAllPayroll() {
  if (useMock) {
    return payrollMock.mockGetAllPayroll();
  }
  const response = await apiClient.get('/payroll');
  return response.data;
}

export async function updatePayroll(userId, data) {
  if (useMock) {
    return payrollMock.mockUpdatePayroll(userId, data);
  }
  const response = await apiClient.patch(`/payroll/${userId}`, data);
  return response.data;
}
