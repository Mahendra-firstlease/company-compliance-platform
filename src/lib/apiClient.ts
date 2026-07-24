import axios from "axios";
const apiUrl = process.env.BASE_API_URL || "http://localhost:3001";
const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
const apiClient = axios.create({
  baseURL:
    typeof window === "undefined"
      ? apiUrl // Server-side hits json-server directly
      : baseUrl, // Client-side routes through Next.js proxy
  withCredentials: true,
  timeout: 10000,
});

// Inject JWT token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Global error handler
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default apiClient;
