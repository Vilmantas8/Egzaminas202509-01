const Reservation = require('../models/Reservation');
const Equipment = require('../models/Equipment');

// Get reservations
const getReservations = async (req, res) => {
  try {
    let reservations;
    
    if (req.user.role === 'admin') {
      // Admin can see all reservations
      reservations = await Reservation.find()
        .populate('user', 'firstName lastName email')
        .populate('equipment', 'name category dailyPrice');
    } else {
      // Regular user can only see their reservations
      reservations = await Reservation.find({ user: req.user._id })
        .populate('equipment', 'name category dailyPrice');
    }
    
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single reservation
const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('equipment', 'name category dailyPrice location');

    if (reservation) {
      // Check if user owns this reservation or is admin
      if (reservation.user._id.toString() === req.user._id.toString() || req.user.role === 'admin') {
        res.json(reservation);
      } else {
        res.status(403).json({ message: 'Access denied' });
      }
    } else {
      res.status(404).json({ message: 'Reservation not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create reservation
const createReservation = async (req, res) => {
  try {
    const { equipment, startDate, endDate, notes } = req.body;

    // Check if equipment exists
    const equipmentItem = await Equipment.findById(equipment);
    if (!equipmentItem) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Check if equipment is available
    if (equipmentItem.status !== 'available') {
      return res.status(400).json({ message: 'Equipment is not available' });
    }

    // Calculate total price (simple calculation)
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const totalPrice = days * equipmentItem.dailyPrice;

    const reservation = await Reservation.create({
      user: req.user._id,
      equipment,
      startDate,
      endDate,
      totalPrice,
      notes
    });

    // Update equipment status
    equipmentItem.status = 'rented';
    await equipmentItem.save();

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('equipment', 'name category dailyPrice');

    res.status(201).json(populatedReservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update reservation status (admin only)
const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (reservation) {
      reservation.status = status;
      await reservation.save();
      
      // If reservation is completed or cancelled, make equipment available
      if (status === 'completed' || status === 'cancelled') {
        const equipment = await Equipment.findById(reservation.equipment);
        if (equipment) {
          equipment.status = 'available';
          await equipment.save();
        }
      }

      res.json(reservation);
    } else {
      res.status(404).json({ message: 'Reservation not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cancel reservation
const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (reservation) {
      // Check if user owns this reservation
      if (reservation.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      reservation.status = 'cancelled';
      await reservation.save();

      // Make equipment available again
      const equipment = await Equipment.findById(reservation.equipment);
      if (equipment) {
        equipment.status = 'available';
        await equipment.save();
      }

      res.json({ message: 'Reservation cancelled successfully' });
    } else {
      res.status(404).json({ message: 'Reservation not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getReservations,
  getReservationById,
  createReservation,
  updateReservationStatus,
  cancelReservation
};
