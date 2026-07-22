/**
 * Dev utility: reset a user's password by email
 * Usage: node scripts/resetTestUser.js
 */
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/devswap';
const TARGET_EMAIL = 'olivia.bennett02@example.com';
const NEW_PASSWORD = 'Test@1234';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const User = require('../models/User');
  // Must use .select('+password') since password field has select:false
  const user = await User.findOne({ email: TARGET_EMAIL }).select('+password');

  if (!user) {
    console.log(`❌ No user found with email: ${TARGET_EMAIL}`);
    process.exit(1);
  }

  // Set plain-text password — the model's pre('save') hook will hash it automatically
  user.password = NEW_PASSWORD;
  await user.save();

  console.log(`✅ Password reset for: ${TARGET_EMAIL}`);
  console.log(`   New password: ${NEW_PASSWORD}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
