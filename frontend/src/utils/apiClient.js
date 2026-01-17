import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://18c750l81c.execute-api.eu-central-1.amazonaws.com/dev/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials:true
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response, // Return the successful response
  async (error) => {
    console.log(error)
    if (error.response && error.response.status === 403) {
      console.log("Access token expired, attempting to refresh...");

        try {
          // Maximum number of attempts to refresh the token
          let retryCount = 0;
          const maxRetries = 3;
          
          // Attempt to refresh the token while retrying
          while (retryCount < maxRetries) {
            retryCount++;
            try {
    
              await apiClient.post('/auth/refresh');
              
              return apiClient(error.config); // Retry the request
            } catch (refreshError) {
              console.error("Refresh token error, retrying...", refreshError);
              // If refresh token fails, retry up to maxRetries
            }
          }

          window.location.href = "/login";
          
        } catch (refreshError) {
          // Handle if refresh token request fails (network error, etc.)
          console.error("Refresh token failed", refreshError);
          window.location.href = "/login"; // Redirect to login page
        }
      
    }

    // If other errors happen, reject the error (usual flow)
    return Promise.reject(error);
  }
);

export default apiClient;
