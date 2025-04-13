import axios from 'axios';

const instance = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the token to all requests
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;