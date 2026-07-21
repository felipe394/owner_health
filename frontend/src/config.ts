const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    const { hostname, port } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      if (port === '5173' || port === '3000' || port === '8080') {
        return 'http://localhost:3001';
      }
    }
  }
  return '';
};

export const API_URL = getApiUrl();
