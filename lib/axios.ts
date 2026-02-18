import axios from "axios";

// API URL configuration:
// - Local development: uses http://localhost:3001/api (default fallback)
// - Production: uses NEXT_PUBLIC_API_URL from .env.production or environment
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (error) {
        console.error("Error parsing auth storage:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized - token expired or invalid
      if (error.response.status === 401) {
        // Clear auth state only - let component-level auth checks handle redirect
        // This prevents potential redirect loops
        localStorage.removeItem("auth-storage");
        console.warn(
          "401 Unauthorized - auth cleared, components will handle redirect",
        );
      }

      // Handle 403 Forbidden
      if (error.response.status === 403) {
        // Check if this is an access denied error for approved/rejected leads and user is QA Reviewer
        const errorMessage = error.response.data.message || "";
        if (
          errorMessage.includes("cannot view") &&
          typeof window !== "undefined"
        ) {
          try {
            const userStr = localStorage.getItem("user");
            const user = userStr ? JSON.parse(userStr) : null;

            // If user is QA Reviewer (role_id 5), redirect to leads listing silently
            if (user && user.role_id === 5) {
              console.log(
                "🔄 QA Reviewer access denied - redirecting to leads page...",
              );
              window.location.href = "/leads";
              return Promise.reject(error); // Return early to prevent further processing
            }
          } catch (parseError) {
            console.error("Error parsing user data:", parseError);
          }
        }

        // Only log error if not a QA Reviewer redirect scenario
        console.error("Access forbidden:", error.response.data.message);
      }

      // Handle 500 Internal Server Error
      if (error.response.status === 500) {
        console.error("Server error:", error.response.data.message);
      }
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
