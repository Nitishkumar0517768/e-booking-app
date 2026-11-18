import axios from 'axios';
import { Storage } from '../utils/storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Live production backend URL on Render
export const DEFAULT_PRODUCTION_API_URL = 'https://e-booking-api-ruhd.onrender.com/api';

// Auto-detect the host IP from Expo configuration or environment
export const getBaseURL = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  // 1. In standalone production APK (!__DEV__), always connect to the production cloud backend
  if (!__DEV__) {
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('10.0.2.2')) {
      return envUrl;
    }
    return DEFAULT_PRODUCTION_API_URL;
  }

  // 2. In development with explicit cloud URL
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('10.0.2.2')) {
    return envUrl;
  }

  // 3. Auto-detect dynamic host IP from Expo development server (for mobile Expo Go on local Wi-Fi)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost') {
      return `http://${ip}:5000/api`;
    }
  }

  // 4. Android emulator fallback (only in dev mode)
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  // 5. Default dev localhost
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getBaseURL();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // 45 seconds to accommodate Render free-tier cold starts
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

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return Promise.reject(
        new Error('Connection timed out. The backend server may be waking up from sleep—please try again.')
      );
    }

    if (!error.response && (error.message === 'Network Error' || error.code === 'ERR_NETWORK')) {
      return Promise.reject(
        new Error('Network error. Unable to reach server. Please check internet connection or retry in 15 seconds.')
      );
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.errors ||
      error.message ||
      'Network error. Could not connect to backend server.';
    return Promise.reject(new Error(message));
  }
);
