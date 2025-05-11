/**
 * @fileoverview The service for the authentication, handle the API requests.
 */
import request from "../utils/request";
 
const API_URL = import.meta.env.VITE_API_URL

export const sendCode = async (email: string) => {
  return request.post(`/auth/send-code`, { email });
};
export const verifyCode = async (email: string, code: string) => {
  return request.post(`${API_URL}/auth/verify-code`, { email, code });
};

export const sendLoginCode = async (email: string) => {
  return request.post(`${API_URL}/auth/send-code-login`, { email });
};

export const verifyLogin = async (email: string, code: string) => {
  return request.post(`${API_URL}/auth/verify-login`, { email, code });
};

export const setPasswordApi = async (email: string, password: string) => {
  return request.post(`${API_URL}/auth/set-password`, { email, password });
};

export const register = async (email: string,firstName:string,lastName:string) => {
  return request.post(`${API_URL}/auth/register`, { email,firstName ,lastName});
};

export const login = async (email: string, password: string) => {
  return request.post(`${API_URL}/auth/login`, { email, password });
};

export const signOut = async () => {
  return request.post(`${API_URL}/auth/signout`);
};