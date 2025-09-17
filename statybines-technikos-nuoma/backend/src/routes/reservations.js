const express = require('express');
const router = express.Router();
const {
  getReservations,
  getReservationById,
  createReservation,
  updateReservationStatus,
  cancelReservation
} = require('../controllers/reservationController');
const { protect, admin } = require('../middleware/auth');

// Protected routes
router.get('/', protect, getReservations);
router.get('/:id', protect, getReservationById);
router.post('/', protect, createReservation);
router.put('/:id/cancel', protect, cancelReservation);

// Admin only routes
router.put('/:id/status', protect, admin, updateReservationStatus);

module.exports = router;
