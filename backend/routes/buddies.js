import express from 'express';
import {
  createBuddyProfile,
  getBuddyProfile,
  findBuddies,
  sendBuddyRequest,
  respondToBuddyRequest,
  getBuddyConnections,
  getBuddyStats,
  endBuddyConnection,
  getRecentActivity
} from '../controllers/buddyController.js';
import { verifyFirebaseAuth } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyFirebaseAuth);

// Buddy Profile Management
router.post('/profile', createBuddyProfile);
router.get('/profile', getBuddyProfile);

// Buddy Matching
router.get('/find', findBuddies);

// Connection Management
router.post('/connect', sendBuddyRequest);
router.put('/connections/:connectionId/respond', respondToBuddyRequest);
router.get('/connections', getBuddyConnections);
router.delete('/connections/:connectionId', endBuddyConnection);

// Statistics and Activity
router.get('/stats', getBuddyStats);
router.get('/activity', getRecentActivity);

export default router;
