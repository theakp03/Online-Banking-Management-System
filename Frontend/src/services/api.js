
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach access token to every API request
api.interceptors.request.use(
  (config) => {
    const accessToken = sessionStorage.getItem("access");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Prevent multiple simultaneous refresh requests
let refreshPromise = null;

// Handle expired access tokens
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Don't retry authentication endpoints
    const url = originalRequest.url || "";

    if (
      url.includes("login/") ||
      url.includes("register/") ||
      url.includes("token/refresh/")
    ) {
      return Promise.reject(error);
    }

    // Prevent infinite retry loops
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = sessionStorage.getItem("refresh");

    if (!refreshToken) {
      sessionStorage.removeItem("access");
      sessionStorage.removeItem("refresh");
      sessionStorage.removeItem("user");

      window.location.assign("/login");

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Reuse an ongoing refresh request if one exists
      if (!refreshPromise) {
        refreshPromise = axios
          .post(
            `${api.defaults.baseURL}users/token/refresh/`,
            { refresh: refreshToken }
          )
          .then((response) => {
            const newAccess = response.data.access;

            sessionStorage.setItem("access", newAccess);

            // Save rotated refresh token if provided
            if (response.data.refresh) {
              sessionStorage.setItem(
                "refresh",
                response.data.refresh
              );
            }

            return newAccess;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;

      // Retry the original request
      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);

    } catch (refreshError) {
      sessionStorage.removeItem("access");
      sessionStorage.removeItem("refresh");
      sessionStorage.removeItem("user");

      window.location.assign("/login");

      return Promise.reject(refreshError);
    }
  }
);

export default api;
