// Simple helper functions

// Calculate days between two dates
const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = end.getTime() - start.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysDiff;
};

// Format date to readable string
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('lt-LT');
};

// Generate random booking number
const generateBookingNumber = () => {
  return 'BK' + Date.now().toString().slice(-6);
};

module.exports = {
  calculateDays,
  formatDate,
  generateBookingNumber
};
