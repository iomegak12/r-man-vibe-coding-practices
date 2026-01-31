// Axios instances configuration
import axios from 'axios';
import { API_ENDPOINTS } from './endpoints';

// Create axios instances for each service
export const athsAPI = axios.create({
  baseURL: API_ENDPOINTS.ATHS,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const crmsAPI = axios.create({
  baseURL: API_ENDPOINTS.CRMS,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ormsAPI = axios.create({
  baseURL: API_ENDPOINTS.ORMS,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const cmpsAPI = axios.create({
  baseURL: API_ENDPOINTS.CMPS,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export all instances as an object
export const apiInstances = {
  aths: athsAPI,
  crms: crmsAPI,
  orms: ormsAPI,
  cmps: cmpsAPI,
};

export default athsAPI;
