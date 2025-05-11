/**
 * @fileoverview The service for the user, handle the API requests.
 */
import request from "../utils/request";

const API_URL = import.meta.env.VITE_API_URL; // read the environment variable, from .env file

export const getProfile = async () => {
  return request.get(`${API_URL}/users/profile`);
};

export const updateProfile = async (profileData: {
  firstName: string;
  lastName: string;
}) => {
  return request.put(`${API_URL}/users/update`, profileData);
};

export const changePassword = async (passwordData: {
  oldPassword: string;
  newPassword: string;
}) => {
  return request.put(`${API_URL}/users/change-password`, passwordData);
};

export const getPasskeyAuthOptions = async (sessionId: string) => {
  return request.get(`${API_URL}/auth/passkey/auth-options/${sessionId}`);
};

export const verifyPasskeyAuth = async (data: {
  sessionId: string;
  credential: any;
}) => {
  return request.post(`${API_URL}/auth/passkey/auth-verify`, data);
};
export const getPasskeyRegistrationOptions = async () => {
  return request.post(`${API_URL}/auth/passkey/register-options`);
};

export const verifyPasskeyRegistration = async (data: {
  sessionId: string;
  credential: any;
  deviceName: string;
}) => {
  return request.post(`${API_URL}/auth/passkey/register-verify`, data);
};

export const getUserPasskeys = async () => {
  return request.get(`${API_URL}/auth/passkey/list`);
};

export const deleteUserPasskey = async (passkeyId: string) => {
  return request.delete(`${API_URL}/auth/passkey/${passkeyId}`);
};