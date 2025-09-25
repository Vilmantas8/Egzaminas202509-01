// STATYBINĖS TECHNIKOS REZERVACIJOS SISTEMA - BACKEND
// This is the main server file for our Construction Equipment Rental System
// Written in beginner-friendly style for learning purposes

// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
require('dotenv').config(); // Load environment variables from .env file

// Import date utilities for timezone-aware handling
const { 
  isDateOnly, 
  toUtcRangeFromDates, 
  todayDateStrVilnius,
  nowVilniusAsUtc 
} = require('./utils/dates');

console.log('🚀 Starting Construction Equipment Rental System Backend...');

// Create Express app
const app = express();

// Middleware (functions that run before our routes)
app.use(cors()); // Allow requests from frontend (React app)
app.use(express.json()); // Parse JSON data from requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Connect to MongoDB database
console.log('📡 Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas successfully!');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Stop server if can't connect to database
  });

// MODELS (Database Schemas)

// User Schema - for people who use our system
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // Only these two values allowed
    default: 'user'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Equipment Schema - for construction equipment
const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['excavator', 'crane', 'bulldozer', 'loader', 'truck', 'drill', 'other']
  },
  dailyRate: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['available', 'rented', 'maintenance', 'draft'],
    default: 'available'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  specifications: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Reservation Schema - for equipment rentals
const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model
    required: true
  },
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment', // Reference to Equipment model
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create models from schemas
const User = mongoose.model('User', userSchema);
const Equipment = mongoose.model('Equipment', equipmentSchema);
const Reservation = mongoose.model('Reservation', reservationSchema);

// HELPER FUNCTIONS

// Function to generate JWT token
function generateToken(userId) {
  return jwt.sign(
    { userId: userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' }
  );
}

// Middleware to check if user is authenticated
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Get token from "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next(); // Continue to the next middleware/route
  } catch (error) {
    res.status(403).json({ error: 'Invalid token.' });
  }
}

// Middleware to check if user is admin
async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error checking admin status.' });
  }
}

// ROUTES (API Endpoints)

// Test route - check if server is working
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '🎉 Construction Equipment Rental System Backend is working!', 
    time: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ===== AUTHENTICATION ROUTES =====

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    // Validate input data
    const schema = Joi.object({
      name: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id);

    res.status(201).json({
      message: 'User registered successfully!',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    // Validate input
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Get current user info
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error getting user info.' });
  }
});

// Start server
const PORT = process.env.PORT || 5003;
const server = app.listen(PORT, () => {
  console.log(`🌟 Server is running on port ${PORT}`);
  console.log(`📱 API available at: http://localhost:${PORT}/api`);
  console.log(`🔧 Test endpoint: http://localhost:${PORT}/api/test`);
});

// Handle port conflict errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Error: Port ${PORT} is already in use!`);
    console.log(`💡 Solutions:`);
    console.log(`   1. Kill the process using the port: netstat -ano | findstr :${PORT}`);
    console.log(`   2. Use a different port: set PORT=5004 && npm run dev`);
    console.log(`   3. Or change the port in your .env file`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

// ===== EQUIPMENT ROUTES =====

// Get all published equipment (for regular users) or all equipment (for admins)
app.get('/api/equipment', async (req, res) => {
  try {
    let query = {};
    
    // If not admin, only show available equipment
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    let isAdmin = false;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        isAdmin = user && user.role === 'admin';
      } catch (error) {
        // Token invalid, treat as regular user
      }
    }

    if (!isAdmin) {
      query.status = { $ne: 'draft' }; // Don't show drafts to regular users
    }

    const equipment = await Equipment.find(query).sort({ createdAt: -1 });
    res.json(equipment);

  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ error: 'Server error getting equipment.' });
  }
});

// Get single equipment by ID
app.get('/api/equipment/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found.' });
    }

    res.json(equipment);
  } catch (error) {
    console.error('Get equipment by ID error:', error);
    res.status(500).json({ error: 'Server error getting equipment.' });
  }
});

// Create new equipment (admin only)
app.post('/api/equipment', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Validate input
    const schema = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      category: Joi.string().valid('excavator', 'crane', 'bulldozer', 'loader', 'truck', 'drill', 'other').required(),
      dailyRate: Joi.number().min(0).required(),
      status: Joi.string().valid('available', 'rented', 'maintenance', 'draft').default('available'),
      imageUrl: Joi.string().allow('').default(''),
      specifications: Joi.string().allow('').default('')
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const newEquipment = new Equipment(req.body);
    await newEquipment.save();

    res.status(201).json({
      message: 'Equipment created successfully!',
      equipment: newEquipment
    });

  } catch (error) {
    console.error('Create equipment error:', error);
    res.status(500).json({ error: 'Server error creating equipment.' });
  }
});

// Update equipment (admin only)
app.put('/api/equipment/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found.' });
    }

    // Validate input
    const schema = Joi.object({
      name: Joi.string(),
      description: Joi.string(),
      category: Joi.string().valid('excavator', 'crane', 'bulldozer', 'loader', 'truck', 'drill', 'other'),
      dailyRate: Joi.number().min(0),
      status: Joi.string().valid('available', 'rented', 'maintenance', 'draft'),
      imageUrl: Joi.string().allow(''),
      specifications: Joi.string().allow('')
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updatedEquipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      message: 'Equipment updated successfully!',
      equipment: updatedEquipment
    });

  } catch (error) {
    console.error('Update equipment error:', error);
    res.status(500).json({ error: 'Server error updating equipment.' });
  }
});

// Delete equipment (admin only)
app.delete('/api/equipment/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found.' });
    }

    // Check if equipment has active reservations
    const activeReservations = await Reservation.find({
      equipment: req.params.id,
      status: { $in: ['pending', 'confirmed', 'active'] }
    });

    if (activeReservations.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete equipment with active reservations.' 
      });
    }

    await Equipment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Equipment deleted successfully!' });

  } catch (error) {
    console.error('Delete equipment error:', error);
    res.status(500).json({ error: 'Server error deleting equipment.' });
  }
});

// ===== RESERVATION ROUTES =====

// Get reservations (all for admin, own for users)
app.get('/api/reservations', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    let query = {};

    // If not admin, only show own reservations
    if (user.role !== 'admin') {
      query.user = req.userId;
    }

    const reservations = await Reservation.find(query)
      .populate('user', 'name email')
      .populate('equipment', 'name category dailyRate')
      .sort({ createdAt: -1 });

    res.json(reservations);

  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({ error: 'Server error getting reservations.' });
  }
});

// Get single reservation by ID
app.get('/api/reservations/:id', authenticateToken, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('user', 'name email')
      .populate('equipment', 'name category dailyRate imageUrl');

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found.' });
    }

    // Check if user owns this reservation or is admin
    const user = await User.findById(req.userId);
    if (user.role !== 'admin' && reservation.user._id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(reservation);

  } catch (error) {
    console.error('Get reservation by ID error:', error);
    res.status(500).json({ error: 'Server error getting reservation.' });
  }
});

// Create new reservation
app.post('/api/reservations', authenticateToken, async (req, res) => {
  try {
    // Validate input
    const schema = Joi.object({
      equipment: Joi.string().required(),
      startDate: Joi.date().min('now').required(),
      endDate: Joi.date().greater(Joi.ref('startDate')).required(),
      notes: Joi.string().allow('').default('')
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { equipment, startDate, endDate, notes } = req.body;

    // Check if equipment exists and is available
    const equipmentItem = await Equipment.findById(equipment);
    if (!equipmentItem) {
      return res.status(404).json({ error: 'Equipment not found.' });
    }

    if (equipmentItem.status !== 'available') {
      return res.status(400).json({ error: 'Equipment is not available for rental.' });
    }

    // Check for conflicting reservations
    const conflictingReservations = await Reservation.find({
      equipment: equipment,
      status: { $in: ['pending', 'confirmed', 'active'] },
      $or: [
        { startDate: { $lt: endDate }, endDate: { $gt: startDate } }
      ]
    });

    if (conflictingReservations.length > 0) {
      return res.status(400).json({ 
        error: 'Equipment is already reserved for the selected dates.' 
      });
    }

    // Calculate total cost
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const totalCost = days * equipmentItem.dailyRate;

    // Create reservation
    const newReservation = new Reservation({
      user: req.userId,
      equipment,
      startDate,
      endDate,
      totalCost,
      notes
    });

    await newReservation.save();

    // Populate the reservation for response
    const populatedReservation = await Reservation.findById(newReservation._id)
      .populate('user', 'name email')
      .populate('equipment', 'name category dailyRate');

    res.status(201).json({
      message: 'Reservation created successfully!',
      reservation: populatedReservation
    });

  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ error: 'Server error creating reservation.' });
  }
});

// Update reservation
app.put('/api/reservations/:id', authenticateToken, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found.' });
    }

    const user = await User.findById(req.userId);

    // Check permissions: users can only update own reservations, admins can update any
    if (user.role !== 'admin' && reservation.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Users can only update pending reservations
    if (user.role !== 'admin' && reservation.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Can only update pending reservations.' 
      });
    }

    // Validate input based on user role
    let schema;
    if (user.role === 'admin') {
      schema = Joi.object({
        status: Joi.string().valid('pending', 'confirmed', 'rejected', 'active', 'completed', 'cancelled'),
        startDate: Joi.date(),
        endDate: Joi.date(),
        notes: Joi.string().allow('')
      });
    } else {
      schema = Joi.object({
        startDate: Joi.date().min('now'),
        endDate: Joi.date(),
        notes: Joi.string().allow('')
      });
    }

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // If dates are being updated, recalculate cost
    if (req.body.startDate || req.body.endDate) {
      const equipment = await Equipment.findById(reservation.equipment);
      const startDate = req.body.startDate || reservation.startDate;
      const endDate = req.body.endDate || reservation.endDate;
      const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
      req.body.totalCost = days * equipment.dailyRate;
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('user', 'name email').populate('equipment', 'name category dailyRate');

    res.json({
      message: 'Reservation updated successfully!',
      reservation: updatedReservation
    });

  } catch (error) {
    console.error('Update reservation error:', error);
    res.status(500).json({ error: 'Server error updating reservation.' });
  }
});

// Cancel/Delete reservation
app.delete('/api/reservations/:id', authenticateToken, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found.' });
    }

    const user = await User.findById(req.userId);

    // Check permissions
    if (user.role !== 'admin' && reservation.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Users can only cancel pending reservations
    if (user.role !== 'admin' && reservation.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Can only cancel pending reservations.' 
      });
    }

    await Reservation.findByIdAndDelete(req.params.id);

    res.json({ message: 'Reservation cancelled successfully!' });

  } catch (error) {
    console.error('Delete reservation error:', error);
    res.status(500).json({ error: 'Server error cancelling reservation.' });
  }
});

// ===== STATISTICS ROUTES (ADMIN ONLY) =====

// Get dashboard statistics
app.get('/api/admin/statistics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalEquipment = await Equipment.countDocuments();
    const availableEquipment = await Equipment.countDocuments({ status: 'available' });
    const totalReservations = await Reservation.countDocuments();
    const pendingReservations = await Reservation.countDocuments({ status: 'pending' });
    const totalUsers = await User.countDocuments();

    res.json({
      totalEquipment,
      availableEquipment,
      rentedEquipment: totalEquipment - availableEquipment,
      totalReservations,
      pendingReservations,
      totalUsers
    });

  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: 'Server error getting statistics.' });
  }
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({ error: 'Internal server error.' });
});

console.log('📋 Server setup completed!');
console.log('🔐 Authentication routes: /api/auth/*');
console.log('🏗️  Equipment routes: /api/equipment/*');
console.log('📅 Reservation routes: /api/reservations/*');
console.log('📊 Admin routes: /api/admin/*');
