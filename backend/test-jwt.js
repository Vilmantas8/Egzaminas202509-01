// Test JWT generation specifically
const jwt = require('jsonwebtoken');
require('dotenv').config();

console.log('🔑 Testing JWT functionality...');

// Check if JWT_SECRET exists
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);

// Test JWT token generation
function generateToken(userId) {
  try {
    console.log('🔧 Generating JWT token for userId:', userId);
    const token = jwt.sign(
      { userId: userId }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    console.log('✅ JWT token generated successfully');
    console.log('Token preview:', token.substring(0, 50) + '...');
    return token;
  } catch (error) {
    console.error('❌ JWT generation error:', error);
    throw error;
  }
}

// Test token generation
try {
  const testUserId = '68d4be5c465e5df818308e88'; // Admin user ID from previous test
  const token = generateToken(testUserId);
  
  // Test token verification
  console.log('🔍 Testing token verification...');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('✅ Token verification successful:', decoded);
  
  console.log('🎉 JWT functionality working correctly!');
} catch (error) {
  console.error('❌ JWT test failed:', error);
}

console.log('\n📋 Environment variables check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);