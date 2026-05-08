import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const errors = error.response?.data?.errors;
    const message = (errors?.length ? errors[0] : null) || error.response?.data?.message || 'Something went wrong';

    const isRefreshUrl = originalRequest?.url?.includes('/auth/refresh');
    const isMeUrl = originalRequest?.url?.includes('/auth/me');
    const isAuthAction = ['/auth/login', '/auth/register', '/auth/verify-email', '/auth/resend-verification']
      .some(p => originalRequest?.url?.includes(p));

    if (status === 401 && !originalRequest._retry && !isRefreshUrl && !isMeUrl && !isAuthAction) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch(() => Promise.reject({ message, status }));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        processQueue(null);
        return api(originalRequest);
      } catch {
        processQueue(new Error('refresh failed'));
        window.dispatchEvent(new CustomEvent('auth:expired'));
        return Promise.reject({ message, status });
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject({ message, status });
  }
);

export default api;
