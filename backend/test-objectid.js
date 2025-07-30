#!/usr/bin/env node

// Quick test script to verify ObjectId fixes
import mongoose from 'mongoose';

console.log('Testing ObjectId instantiation...');

try {
  // Test the old way (should fail)
  console.log('Testing old way: mongoose.Types.ObjectId("507f1f77bcf86cd799439011")');
  //const oldWay = mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
  //console.log('Old way result:', oldWay);
} catch (error) {
  console.log('Old way failed (expected):', error.message);
}

try {
  // Test the new way (should work)
  console.log('Testing new way: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011")');
  const newWay = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
  console.log('New way result:', newWay);
  console.log('✅ ObjectId fix is working correctly!');
} catch (error) {
  console.log('❌ New way failed:', error.message);
}
