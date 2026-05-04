import axios from 'axios';

const request = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token');
    if (!token) {
      try {
        token = JSON.parse(localStorage.getItem('agent-office-storage') || '{}')?.state?.token;
      } catch (error) {
        token = null;
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== 200) {
      return Promise.reject(new Error(res.message || 'Error'));
    }
    return res;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default request;
