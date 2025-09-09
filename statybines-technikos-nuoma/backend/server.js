// Įrangos rezervacijos sistemos serveris
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet()); // Saugumo middleware
app.use(cors()); // CORS palaikymas
app.use(express.json()); // JSON parser

// Rate limiting - apribojame užklausų skaičių
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minučių
  max: 100, // maksimaliai 100 užklausų per 15 min
  message: 'Per daug užklausų, bandykite vėliau'
});
app.use('/api/', limiter);

// MongoDB prisijungimas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB prisijungimas sėkmingas'))
.catch((err) => console.error('MongoDB prisijungimo klaida:', err));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/equipment', require('./src/routes/equipment'));
app.use('/api/reservations', require('./src/routes/reservations'));

// Pagrindinė route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Įrangos rezervacijos sistemos API',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Serverio klaida' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint nerastas' 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveris veikia ant porto ${PORT}`);
});

module.exports = app;
