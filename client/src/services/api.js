import axios from 'axios';

const envApiUrl = process.env.REACT_APP_API_URL;
const isProd = process.env.NODE_ENV === 'production';
const baseURL = isProd && envApiUrl && envApiUrl.includes('localhost')
  ? '/api'
  : (envApiUrl || '/api');

const API = axios.create({
  baseURL,
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
