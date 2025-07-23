import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getForums,
  getForumById,
  createForumPost,
  replyToPost,
  toggleLike,
  getLanguageBuddies,
  createBuddyRequest,
  searchPosts,
  updatePost,
  deletePost
} from '../controllers/communityController.js';

const router = express.Router();

// Public routes (some may need auth later)
router.get('/forums', getForums);
router.get('/forums/:id', getForumById);
router.get('/search', searchPosts);

// Protected routes
router.post('/forums', verifyToken, createForumPost);
router.post('/forums/:id/reply', verifyToken, replyToPost);
router.post('/posts/:id/like', verifyToken, toggleLike);
router.get('/buddies', verifyToken, getLanguageBuddies);
router.post('/buddies', verifyToken, createBuddyRequest);
router.put('/posts/:id', verifyToken, updatePost);
router.delete('/posts/:id', verifyToken, deletePost);

export default router;
