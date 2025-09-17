const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Connect to MongoDB - simple version
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/equipment', require('./src/routes/equipment'));
app.use('/api/reservations', require('./src/routes/reservations'));

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Home route
app.get('/', (req, res) => {
  res.json({ message: 'Equipment Rental API' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
