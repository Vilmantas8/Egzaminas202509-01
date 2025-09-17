// Simple error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: err.message 
  });
};

// Simple 404 handler
const notFound = (req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
};

module.exports = { errorHandler, notFound };
