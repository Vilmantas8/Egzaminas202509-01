const express = require('express');
const router = express.Router();
const {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  checkAvailability
} = require('../controllers/equipmentController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', getEquipment);
router.get('/:id', getEquipmentById);
router.get('/:id/availability', checkAvailability);

// Admin only routes
router.post('/', protect, admin, createEquipment);
router.put('/:id', protect, admin, updateEquipment);
router.delete('/:id', protect, admin, deleteEquipment);

module.exports = router;
