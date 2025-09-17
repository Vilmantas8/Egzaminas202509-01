// Date validation utilities for reservations
export const dateValidation = {
  // Check if dates conflict with existing reservations
  checkDateConflicts: (existingReservations, newStartDate, newEndDate, excludeId = null) => {
    const newStart = new Date(newStartDate);
    const newEnd = new Date(newEndDate);
    
    return existingReservations
      .filter(reservation => reservation._id !== excludeId)
      .some(reservation => {
        const existingStart = new Date(reservation.startDate);
        const existingEnd = new Date(reservation.endDate);
        
        return (newStart < existingEnd && newEnd > existingStart);
      });
  },

  // Validate reservation date range
  validateDateRange: (startDate, endDate) => {
    const errors = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of day
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check if start date is in the past
    if (start < now) {
      errors.push('Start date cannot be in the past');
    }
    
    // Check if end date is after start date
    if (end <= start) {
      errors.push('End date must be after start date');
    }
    
    // Check minimum rental period (1 day)
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (daysDiff < 1) {
      errors.push('Minimum rental period is 1 day');
    }
    
    // Check maximum rental period (90 days)
    if (daysDiff > 90) {
      errors.push('Maximum rental period is 90 days');
    }
    
    // Check maximum advance booking (365 days)
    const maxAdvanceDate = new Date();
    maxAdvanceDate.setDate(maxAdvanceDate.getDate() + 365);
    if (start > maxAdvanceDate) {
      errors.push('Cannot book more than 1 year in advance');
    }
    
    return errors;
  },

  // Format date for display
  formatDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Calculate days between dates
  calculateDays: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  }
};