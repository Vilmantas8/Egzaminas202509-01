const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['krautuvai', 'betonmaises', 'generatoriai', 'pjovimo-irankiai', 'kita']
  },
  dailyPrice: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'available', // available, rented, maintenance
    enum: ['available', 'rented', 'maintenance']
  },
  image: {
    type: String,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Equipment', equipmentSchema);
