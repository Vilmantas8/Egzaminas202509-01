// SEED DATABASE WITH SAMPLE DATA
// Run this file to add some example equipment to the database
// This is for testing and development purposes only

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models (same schemas as in server.js)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true, enum: ['excavator', 'crane', 'bulldozer', 'loader', 'truck', 'drill', 'other'] },
  dailyRate: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['available', 'rented', 'maintenance', 'draft'], default: 'available' },
  imageUrl: { type: String, default: '' },
  specifications: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Equipment = mongoose.model('Equipment', equipmentSchema);

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'user123',
    role: 'user'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'user123',
    role: 'user'
  }
];

const sampleEquipment = [
  {
    name: 'Caterpillar 320D Excavator',
    description: 'Heavy-duty excavator perfect for construction sites. 20-ton capacity with hydraulic hammer attachment.',
    category: 'excavator',
    dailyRate: 350,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800',
    specifications: 'Operating Weight: 20,300 kg, Engine Power: 121 kW, Bucket Capacity: 0.9 m³'
  },
  {
    name: 'Liebherr LTM 1050 Mobile Crane',
    description: 'All-terrain mobile crane with 50-ton lifting capacity. Perfect for high-rise construction.',
    category: 'crane',
    dailyRate: 800,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800',
    specifications: 'Max Lifting Capacity: 50 tons, Max Boom Length: 36m, Max Height: 56m'
  },
  {
    name: 'Komatsu D155A Bulldozer',
    description: 'Powerful bulldozer for earthmoving and grading operations. Heavy-duty blade included.',
    category: 'bulldozer',
    dailyRate: 450,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1621193554107-6f8d7ac8e3b6?w=800',
    specifications: 'Operating Weight: 38,000 kg, Engine Power: 264 kW, Blade Capacity: 4.6 m³'
  },
  {
    name: 'JCB 3CX Backhoe Loader',
    description: 'Versatile backhoe loader for digging, loading, and material handling.',
    category: 'loader',
    dailyRate: 280,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800',
    specifications: 'Operating Weight: 8,300 kg, Engine Power: 74 kW, Dig Depth: 5.7m'
  },
  {
    name: 'Volvo A30G Articulated Truck',
    description: 'Heavy-duty articulated dump truck for transporting materials on rough terrain.',
    category: 'truck',
    dailyRate: 320,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1548139942-7b8f7b6b6b1b?w=800',
    specifications: 'Payload Capacity: 28 tons, Engine Power: 265 kW, Body Volume: 18 m³'
  },
  {
    name: 'Atlas Copco ROC D7 Drill Rig',
    description: 'Surface drilling rig for blast hole drilling in quarries and open-pit mines.',
    category: 'drill',
    dailyRate: 600,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800',
    specifications: 'Max Hole Diameter: 127mm, Drilling Depth: 15m, Engine Power: 129 kW'
  },
  {
    name: 'Caterpillar 336F Excavator',
    description: 'Another excavator for large projects. Currently under maintenance.',
    category: 'excavator',
    dailyRate: 380,
    status: 'maintenance',
    imageUrl: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800',
    specifications: 'Operating Weight: 36,200 kg, Engine Power: 200 kW, Bucket Capacity: 1.7 m³'
  },
  {
    name: 'Manitowoc MLC300 Crawler Crane',
    description: 'Large crawler crane for heavy lifting operations. Draft status - under review.',
    category: 'crane',
    dailyRate: 1200,
    status: 'draft',
    imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800',
    specifications: 'Max Lifting Capacity: 300 tons, Max Boom Length: 91m, Operating Weight: 287 tons'
  }
];

// Function to seed the database
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (BE CAREFUL IN PRODUCTION!)
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Equipment.deleteMany({});

    // Create users with hashed passwords
    console.log('👥 Creating sample users...');
    const usersWithHashedPasswords = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );
    
    await User.insertMany(usersWithHashedPasswords);
    console.log(`✅ Created ${usersWithHashedPasswords.length} users`);

    // Create equipment
    console.log('🏗️  Creating sample equipment...');
    await Equipment.insertMany(sampleEquipment);
    console.log(`✅ Created ${sampleEquipment.length} equipment items`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Sample Login Credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('User: john@example.com / user123');
    console.log('User: jane@example.com / user123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
  }
}

// Run the seeding function
seedDatabase();
