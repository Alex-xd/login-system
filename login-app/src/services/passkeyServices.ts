/**
 * @fileoverview The service for the passkey, handle the API requests.
 */
import request from "../utils/request";

const API_URL =  import.meta.env.VITE_API_URL
const PASSKEY_API = `${API_URL}/auth/passkey`;


// get the passkey authentication options
export const getPasskeyAuthOptions = async () => {
  return request.get(`${PASSKEY_API}/auth-options`);
};

// verify the passkey authentication
export const verifyPasskeyAuth = async (data: { sessionId: string; credential: any }) => {
  return request.post(`${PASSKEY_API}/auth-verify`, data);
};

// get the passkey registration options
export const getPasskeyRegistrationOptions = async () => {
  return request.post(`${PASSKEY_API}/register-options`);
};

// verify the passkey registration
export const verifyPasskeyRegistration = async (data: {
  sessionId: string;
  credential: any;
  deviceName: string;
}) => {
  return request.post(`${PASSKEY_API}/register-verify`, data);
};

// get the user's passkey list
export const getUserPasskeys = async () => {
  return request.get(`${PASSKEY_API}/list`);
};

// delete the user's passkey
export const deleteUserPasskey = async (passkeyId: string) => {
  return request.delete(`${PASSKEY_API}/${passkeyId}`);
};