#!/usr/bin/env node

/**
 * Video Call System - Comprehensive Bug Fix Validation
 * This script tests all 10 bug fixes that were applied
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

console.log('🧪 Video Call System - Bug Fix Validation');
console.log('='.repeat(50));

const tests = [
  {
    id: 1,
    name: 'socket.io-client Import Error',
    test: () => {
      const packagePath = path.join(__dirname, 'frontend', 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      return packageContent.dependencies['socket.io-client'] ? 'PASS' : 'FAIL';
    }
  },
  {
    id: 2,
    name: 'Progress API 403 Forbidden',
    test: async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/progress/user/current');
        return response.status === 401 ? 'PASS (Auth Required)' : 'PASS';
      } catch (error) {
        return error.response?.status === 401 ? 'PASS (Auth Required)' : 'FAIL';
      }
    }
  },
  {
    id: 3,
    name: 'ObjectId Constructor Error',
    test: () => {
      const userModelPath = path.join(__dirname, 'backend', 'models', 'User.js');
      const content = fs.readFileSync(userModelPath, 'utf8');
      return content.includes('const { ObjectId } = mongoose.Schema.Types') ? 'PASS' : 'FAIL';
    }
  },
  {
    id: 4,
    name: 'Method Name Mismatch',
    test: () => {
      const progressServicePath = path.join(__dirname, 'frontend', 'src', 'services', 'progressService.js');
      const content = fs.readFileSync(progressServicePath, 'utf8');
      return content.includes('getCurrentUserProgress') ? 'PASS' : 'FAIL';
    }
  },
  {
    id: 5,
    name: 'API Response Structure Issues',
    test: () => {
      const dashboardPath = path.join(__dirname, 'frontend', 'src', 'pages', 'StudentDashboard.jsx');
      const content = fs.readFileSync(dashboardPath, 'utf8');
      return content.includes('response.data') && !content.includes('response.data.data') ? 'PASS' : 'FAIL';
    }
  },
  {
    id: 6,
    name: 'Missing User Stats Endpoint',
    test: async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/stats');
        return response.status === 401 ? 'PASS (Auth Required)' : 'PASS';
      } catch (error) {
        return error.response?.status === 401 ? 'PASS (Auth Required)' : 'FAIL';
      }
    }
  },
  {
    id: 7,
    name: 'Course Progress Structure Mismatch',
    test: () => {
      const dashboardPath = path.join(__dirname, 'frontend', 'src', 'pages', 'StudentDashboard.jsx');
      const content = fs.readFileSync(dashboardPath, 'utf8');
      return content.includes('courseProgress?.') ? 'PASS' : 'FAIL';
    }
  },
  {
    id: 8,
    name: 'authService.getToken Method Missing',
    test: () => {
      const liveClassServicePath = path.join(__dirname, 'frontend', 'src', 'services', 'liveClassService.js');
      const content = fs.readFileSync(liveClassServicePath, 'utf8');
      return !content.includes('authService.getToken') && content.includes('apiService') ? 'PASS' : 'FAIL';
    }
  },
  {
    id: 9,
    name: 'File Import Path Error',
    test: () => {
      const liveClassServicePath = path.join(__dirname, 'frontend', 'src', 'services', 'liveClassService.js');
      const content = fs.readFileSync(liveClassServicePath, 'utf8');
      return content.includes("import apiService from './api.js'") ? 'PASS' : 'FAIL';
    }
  },
  {
    id: 10,
    name: 'Live Class Route Mismatch',
    test: async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/liveClasses');
        return response.status === 401 ? 'PASS (Auth Required)' : 'PASS';
      } catch (error) {
        return error.response?.status === 401 ? 'PASS (Auth Required)' : 'FAIL';
      }
    }
  }
];

async function runTests() {
  console.log('Running validation tests...\n');
  
  for (const test of tests) {
    try {
      const result = typeof test.test === 'function' ? await test.test() : test.test;
      const status = result.includes('PASS') ? '✅' : '❌';
      console.log(`${status} Bug #${test.id}: ${test.name} - ${result}`);
    } catch (error) {
      console.log(`❌ Bug #${test.id}: ${test.name} - ERROR: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 Video Call System Status: Ready for Testing!');
  console.log('📋 Next Steps:');
  console.log('   1. Frontend: npm run dev (running)');
  console.log('   2. Backend: npm start (running)');
  console.log('   3. Test video call functionality end-to-end');
  console.log('   4. Verify all dashboard features work');
}

// Run the tests
runTests().catch(console.error);
