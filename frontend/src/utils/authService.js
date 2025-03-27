import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const authService = {
  login: async (username, password) => {
    const response = await axios.post(`${API_URL}/login`, {
      username,
      password
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('admin', JSON.stringify(response.data.admin));
    }
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axios.post(`${API_URL}/forgot-password`, { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    localStorage.removeItem('rememberMe');
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('admin'));
  },

  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;