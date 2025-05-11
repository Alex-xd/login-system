/**
 * @fileoverview Axios request utility, handle the API requests.
 */
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";


// define the interface to describe the return data structure
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

const API_URL = import.meta.env.VITE_API_URL;


// create the Axios instance
const service: AxiosInstance = axios.create({
  baseURL: API_URL, // read the environment variable
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
});

// request interceptor
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    console.log("response", response);

    if (response.data.code !== 200) {
      console.error("API Error:", response.data.message);
      return Promise.reject(response.data.message);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          // unauthorized
          console.error("Unauthorized");
          break;
        case 403:
          localStorage.removeItem("token");
          setTimeout(() => {
            window.location.href = "/signin";
          }, 3000);  // delay 3 seconds and redirect
          break;
        case 500:
          console.error("Server error:", data.message || "Unknown error.");
          break;
        default:
          console.error("Error:", data.message || "Unknown error.");
      }
    }
    return Promise.reject(error);
  }
);

export default service;
