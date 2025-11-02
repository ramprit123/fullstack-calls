import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Custom hook to get authenticated API instance
export const useAuthenticatedApi = () => {
  const { getToken } = useAuth();

  const authenticatedApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add request interceptor to include auth token
  authenticatedApi.interceptors.request.use(
    async (config) => {
      try {
        const token = await getToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Failed to get auth token:", error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return authenticatedApi;
};

export default api;
