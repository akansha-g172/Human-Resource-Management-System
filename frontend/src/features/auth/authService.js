import apiClient from '../../api/apiClient';
import { mockLogin, mockSignUp } from '../../mocks/authMock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export async function login(identifier, password) {
  if (USE_MOCK) {
    return mockLogin(identifier, password);
  }
  const response = await apiClient.post('/auth/login', { identifier, password });
  return response.data.data;
}

export async function signUp(data) {
  if (USE_MOCK) {
    return mockSignUp(data);
  }
  const response = await apiClient.post('/auth/signup', data);
  return response.data.data;
}
