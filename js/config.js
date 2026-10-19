/**
 * Dating Web App Configuration
 * Automatically switches between local development (empty origin)
 * and production Vercel backend.
 */
window.API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? ''
  : 'https://dating-backend-dusky.vercel.app';
