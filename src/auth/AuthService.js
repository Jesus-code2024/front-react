// src/auth/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/signin`, credentials);
    return response.data;
  } catch (error) {
    throw error.response.data; 
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};


axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});