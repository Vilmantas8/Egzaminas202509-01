// Test authentication issue debugging
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function testAuth() {
  try {
    console.log('🔧 Testing authentication debugging...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test admin user
    console.log('🔍 Looking for admin user...');
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    console.log('Admin user found:', adminUser ? 'YES' : 'NO');
    if (adminUser) {
      console.log('Admin user details:', {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role,
        passwordLength: adminUser.password.length,
        passwordHash: adminUser.password.substring(0, 20) + '...'
      });
    }

    // Test password comparison
    if (adminUser) {
      console.log('🔐 Testing password comparison...');
      const isValidPassword = await bcrypt.compare('admin123', adminUser.password);
      console.log('Password comparison result:', isValidPassword);
    }

    // Test regular user
    console.log('🔍 Looking for regular user...');
    const regularUser = await User.findOne({ email: 'john@example.com' });
    console.log('Regular user found:', regularUser ? 'YES' : 'NO');
    if (regularUser) {
      console.log('Regular user details:', {
        id: regularUser._id,
        email: regularUser.email,
        role: regularUser.role
      });
    }

    // List all users
    console.log('📋 All users in database:');
    const allUsers = await User.find({}, 'email role createdAt');
    console.log(allUsers);

    console.log('🎉 Authentication debugging completed!');
    
  } catch (error) {
    console.error('❌ Error during authentication test:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
  }
}

// Run the test
testAuth();