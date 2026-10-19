/**
 * Dating Web App Configuration
 * If deploying Frontend and Backend as separate Vercel projects,
 * set your Backend Vercel domain below (e.g. 'https://dating-backend.vercel.app').
 * When running locally on localhost:5000, leave it empty ('') for same-origin.
 */
window.API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? ''
  : ''; // Set to 'https://your-backend.vercel.app' if backend is on a separate domain
