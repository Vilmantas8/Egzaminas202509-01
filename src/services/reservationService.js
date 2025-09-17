// Reservation Service - Core reservation functionality
export class ReservationService {
  static async createReservation(reservationData) {
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(reservationData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create reservation');
    }

    return await response.json();
  }

  static async getUserReservations() {
    const response = await fetch('/api/reservations/user', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch reservations');
    }

    return await response.json();
  }

  static async updateReservation(id, updates) {
    const response = await fetch(`/api/reservations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update reservation');
    }

    return await response.json();
  }

  static async cancelReservation(id) {
    const response = await fetch(`/api/reservations/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel reservation');
    }

    return await response.json();
  }

  static validateReservationDates(startDate, endDate) {
    const errors = [];
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < now) {
      errors.push('Start date cannot be in the past');
    }

    if (end <= start) {
      errors.push('End date must be after start date');
    }

    const maxAdvanceDays = 365;
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + maxAdvanceDays);
    
    if (start > maxDate) {
      errors.push(`Reservations cannot be made more than ${maxAdvanceDays} days in advance`);
    }

    return errors;
  }

  static calculateTotalCost(pricePerDay, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return daysDiff * pricePerDay;
  }

  static async checkAvailability(equipmentId, startDate, endDate) {
    const response = await fetch(`/api/equipment/${equipmentId}/availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ startDate, endDate })
    });

    if (!response.ok) {
      throw new Error('Failed to check availability');
    }

    return await response.json();
  }
}