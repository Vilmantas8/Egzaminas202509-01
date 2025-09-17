// Reservation API endpoints
export const reservationApi = {
  endpoints: {
    create: '/api/reservations',
    getAll: '/api/reservations',
    getById: (id) => `/api/reservations/${id}`,
    update: (id) => `/api/reservations/${id}`,
    cancel: (id) => `/api/reservations/${id}/cancel`,
    getUserReservations: '/api/reservations/user',
    getAdminReservations: '/api/reservations/admin'
  },

  async makeRequest(url, options = {}) {
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return await response.json();
  }
};