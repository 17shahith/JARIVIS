// Centralized API Wrapper for JARVIS Neural Interface

export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => localStorage.setItem('token', token);
export const removeAuthToken = () => localStorage.removeItem('token');

/**
 * Custom fetch wrapper that automatically appends Bearer JWT headers
 * and redirects to login if unauthorized (401).
 */
export const apiRequest = async (url, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      removeAuthToken();
      // Only redirect if not already on the login page
      if (!window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
      }
      throw new Error('Session expired. Please log in.');
    }

    return response;
  } catch (error) {
    console.error(`API Request failed on ${url}:`, error.message);
    throw error;
  }
};
// Expose on window for easy migration of other modules
window.apiRequest = apiRequest;
