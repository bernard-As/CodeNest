
import axios from 'axios';
import { environment } from './environment';

let token = localStorage.getItem('token')


const baseApi = axios.create({
    baseURL: `${environment.apiUrl}`, // Replace with your API base URL
    // timeout: 1000, // Optional: Set a timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

export default baseApi;

// Interceptor
baseApi.interceptors.request.use(
    (config) => {
        // Add token to the request headers
        config.headers['Authorization'] = `Bearer ${token}`
        return config;
    },
    (error) => {
        // Do something with request error
        return Promise.reject(error);
    }
)

baseApi.interceptors.response.use(
    (response) => {
      // Any status code that lie within the range of 2xx cause this function to trigger
      return response;
    },
    (error) => {
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      if (error.response) {
        // Check for 401 status code
        if (error.response.status === 401) {
          // Handle the 401 Unauthorized response
          console.log('Unauthorized access - redirecting to login or showing a message.');
          // You can redirect to a login page or show a modal, etc.
        }
      }
      // Return a rejected promise to keep the error handling chain
      return Promise.reject(error);
    }
  );