import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds request timeout
});

// Response interceptor to format errors uniformly
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Standardize error formats matching our backend exception responses
    const originalError = error;
    let customError = {
      message: 'A network communication error occurred. Please try again.',
      code: 'NETWORK_ERROR',
      details: {},
      status: 500
    };

    if (error.response) {
      const data = error.response.data;
      customError.status = error.response.status;
      
      if (data && data.error) {
        customError.message = data.error.message || customError.message;
        customError.code = data.error.code || customError.code;
        customError.details = data.error.details || customError.details;
      } else if (data && typeof data === 'string') {
        customError.message = data;
      }
    } else if (error.request) {
      customError.message = 'No response was received from the server. Check your connection.';
      customError.code = 'NO_RESPONSE';
    }

    return Promise.reject(customError);
  }
);

export default api;
