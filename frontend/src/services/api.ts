import axios from 'axios';
import { Storage } from '../utils/storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Auto-detect the host IP from Expo configuration or environment
export const getBaseURL = () => {
  // 1. Auto-detect dynamic host IP from Expo development server (seamless for mobile Expo Go)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost') {
      return `http://${ip}:5000/api`;
    }
  }

  // 2. Check EXPO_PUBLIC_API_URL
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && (Platform.OS === 'web' || !envUrl.includes('localhost'))) {
    return envUrl;
  }

  // 3. Android emulator fallback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  // 4. Default localhost (web / iOS simulator)
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getBaseURL();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: Attach JWT token and allow dynamic custom baseURL
api.interceptors.request.use(
  async (config) => {
    try {
      const customUrl = await Storage.getItem('custom_api_url');
      if (customUrl) {
        config.baseURL = customUrl;
      }
    } catch (_) {}

    const token = await Storage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Extract response data and handle auth expiration
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await Storage.removeItem('auth_token');
      await Storage.removeItem('auth_user');
    }
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors ||
      error.message ||
      'Network error. Could not connect to backend server.';
    return Promise.reject(new Error(message));
  }
);
