import express from 'express';
import { body } from 'express-validator';
import {
  sendMessage,
  getMessages,
  getChatHistory,
  markAsRead,
  getUnreadCount,
  getAvailableTeachers,
  requestTeacherChat,
  endChatSession,
  getUserChats,
  getChatMessages,
  createChat,
  markMessagesRead,
  addParticipant,
  removeParticipant
} from '../controllers/chatController.js';
import { 
  verifyFirebaseAuth, 
  isStudent, 
  isTeacher 
} from '../middleware/auth.js';

const router = express.Router();

// Chat routes
router.post('/send', verifyFirebaseAuth, [
  body('recipientId').isMongoId().withMessage('Valid recipient ID is required'),
  body('message').trim().isLength({ min: 1 }).withMessage('Message cannot be empty'),
  body('type').optional().isIn(['text', 'image', 'audio', 'file']),
], sendMessage);

router.get('/messages/:chatId', verifyFirebaseAuth, getMessages);
router.get('/history', verifyFirebaseAuth, getChatHistory);
router.put('/read/:messageId', verifyFirebaseAuth, markAsRead);
router.get('/unread-count', verifyFirebaseAuth, getUnreadCount);

// Teacher chat system
router.get('/teachers/available', verifyFirebaseAuth, isStudent, getAvailableTeachers);
router.post('/teachers/request', verifyFirebaseAuth, isStudent, [
  body('teacherId').optional().isMongoId(),
  body('subject').trim().isLength({ min: 1 }).withMessage('Subject is required'),
  body('language').isIn(['french', 'japanese', 'german', 'spanish', 'korean']).withMessage('Invalid language'),
], requestTeacherChat);

router.post('/session/:sessionId/end', verifyFirebaseAuth, endChatSession);

// Real-time Chat Routes

// Get user's chat rooms
router.get('/user/:userId/chats', verifyFirebaseAuth, getUserChats);

// Create new chat
router.post('/create', verifyFirebaseAuth, [
  body('name').trim().isLength({ min: 1 }).withMessage('Chat name is required'),
  body('type').isIn(['private', 'group', 'support', 'announcement', 'study_group']).withMessage('Invalid chat type'),
  body('participantIds').isArray({ min: 1 }).withMessage('At least one participant is required'),
  body('participantIds.*').isMongoId().withMessage('Invalid participant ID'),
  body('courseId').optional().isMongoId().withMessage('Invalid course ID')
], createChat);

// Get chat messages
router.get('/:chatId/messages', verifyFirebaseAuth, getChatMessages);

// Send message to chat
router.post('/:chatId/message', verifyFirebaseAuth, [
  body('content').trim().isLength({ min: 1 }).withMessage('Message content is required'),
  body('type').optional().isIn(['text', 'image', 'file', 'audio', 'video']).withMessage('Invalid message type'),
  body('attachments').optional().isArray()
], sendMessage);

// Mark messages as read
router.post('/:chatId/read', verifyFirebaseAuth, [
  body('messageIds').isArray().withMessage('Message IDs array is required'),
  body('messageIds.*').isMongoId().withMessage('Invalid message ID')
], markMessagesRead);

// Add participant to chat
router.post('/:chatId/participants', verifyFirebaseAuth, [
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('role').optional().isIn(['admin', 'moderator', 'member']).withMessage('Invalid role')
], addParticipant);

// Remove participant from chat
router.delete('/:chatId/participants/:userId', verifyFirebaseAuth, removeParticipant);

export default router;
