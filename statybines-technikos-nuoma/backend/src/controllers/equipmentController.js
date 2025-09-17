const Equipment = require('../models/Equipment');

// Get all equipment
const getEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find({ isActive: true }).populate('owner', 'firstName lastName');
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single equipment
const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id).populate('owner', 'firstName lastName');
    
    if (equipment) {
      res.json(equipment);
    } else {
      res.status(404).json({ message: 'Equipment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create equipment (admin only)
const createEquipment = async (req, res) => {
  try {
    const { name, description, category, dailyPrice, location, image } = req.body;

    const equipment = await Equipment.create({
      name,
      description,
      category,
      dailyPrice,
      location,
      image,
      owner: req.user._id
    });

    res.status(201).json(equipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update equipment (admin only)
const updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (equipment) {
      equipment.name = req.body.name || equipment.name;
      equipment.description = req.body.description || equipment.description;
      equipment.category = req.body.category || equipment.category;
      equipment.dailyPrice = req.body.dailyPrice || equipment.dailyPrice;
      equipment.location = req.body.location || equipment.location;
      equipment.status = req.body.status || equipment.status;
      equipment.image = req.body.image || equipment.image;

      const updatedEquipment = await equipment.save();
      res.json(updatedEquipment);
    } else {
      res.status(404).json({ message: 'Equipment not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete equipment (admin only)
const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (equipment) {
      equipment.isActive = false;
      await equipment.save();
      res.json({ message: 'Equipment deleted' });
    } else {
      res.status(404).json({ message: 'Equipment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check equipment availability
const checkAvailability = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    
    if (equipment) {
      res.json({ 
        available: equipment.status === 'available',
        status: equipment.status 
      });
    } else {
      res.status(404).json({ message: 'Equipment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  checkAvailability
};
