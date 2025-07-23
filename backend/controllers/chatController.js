import { validationResult } from 'express-validator';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import socketService from '../services/socketService.js';

// Get user's chat rooms
export const getUserChats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check permissions
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const chats = await Chat.find({
      'participants.user': userId,
      'participants.isActive': true,
      isActive: true
    })
    .populate('participants.user', 'firstName lastName avatar isOnline lastSeen')
    .populate('lastMessage.sender', 'firstName lastName avatar')
    .sort({ lastActivity: -1 });

    // Calculate unread counts
    const chatsWithUnread = await Promise.all(
      chats.map(async (chat) => {
        const participant = chat.participants.find(p => p.user._id.toString() === userId);
        const lastSeen = participant ? participant.lastSeen : new Date(0);

        const unreadCount = chat.messages.filter(msg =>
          msg.timestamp > lastSeen &&
          msg.sender.toString() !== userId &&
          !msg.isDeleted
        ).length;

        return {
          ...chat.toObject(),
          unreadCount
        };
      })
    );

    res.json({
      success: true,
      data: { chats: chatsWithUnread }
    });

  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get chat messages
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(p =>
      p.user.toString() === req.user.id && p.isActive
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get paginated messages
    const skip = (page - 1) * limit;
    const messages = chat.messages
      .filter(msg => !msg.isDeleted)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(skip, skip + parseInt(limit))
      .reverse();

    // Populate sender information
    await chat.populate('messages.sender', 'firstName lastName avatar');

    res.json({
      success: true,
      data: {
        messages,
        hasMore: chat.messages.length > skip + parseInt(limit),
        totalMessages: chat.messages.filter(msg => !msg.isDeleted).length
      }
    });

  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create new chat
export const createChat = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, type, participantIds, courseId, description } = req.body;

    // Validate participants
    const participants = await User.find({ _id: { $in: participantIds } });
    if (participants.length !== participantIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some participants not found'
      });
    }

    // Create chat
    const chatData = {
      name,
      type,
      description,
      participants: participantIds.map(userId => ({
        user: userId,
        role: userId === req.user.id ? 'admin' : 'member',
        joinedAt: new Date(),
        lastSeen: new Date(),
        isActive: true
      })),
      createdBy: req.user.id,
      courseId,
      isActive: true,
      lastActivity: new Date()
    };

    const chat = await Chat.create(chatData);
    await chat.populate('participants.user', 'firstName lastName avatar');

    // Notify participants via socket
    participantIds.forEach(userId => {
      if (userId !== req.user.id) {
        socketService.sendToUser(userId, 'new_chat_created', {
          chat: chat.toObject()
        });
      }
    });

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: { chat }
    });

  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Send message (HTTP endpoint - real-time handled by socket)
export const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { chatId } = req.params;
    const { content, type = 'text', attachments = [] } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(p =>
      p.user.toString() === req.user.id && p.isActive
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Create message
    const message = {
      sender: req.user.id,
      content,
      type,
      attachments,
      timestamp: new Date(),
      readBy: [{ user: req.user.id, readAt: new Date() }]
    };

    // Add message to chat
    chat.messages.push(message);
    chat.lastMessage = message;
    chat.lastActivity = new Date();
    await chat.save();

    // Populate sender info
    await chat.populate('messages.sender', 'firstName lastName avatar');
    const populatedMessage = chat.messages[chat.messages.length - 1];

    // Send via socket to all participants
    socketService.sendToRoom(chatId, 'new_message', {
      chatId,
      message: populatedMessage
    });

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: { message: populatedMessage }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Legacy method for compatibility
export const getMessages = async (req, res) => {
  return getChatMessages(req, res);
};

export const getChatHistory = async (req, res) => {
  return getUserChats(req, res);
};

export const markAsRead = async (req, res) => {
  res.json({
    success: true,
    message: 'Chat endpoints will be implemented in Phase 5'
  });
};

export const getUnreadCount = async (req, res) => {
  res.json({
    success: true,
    message: 'Chat endpoints will be implemented in Phase 5',
    data: { unreadCount: 0 }
  });
};

export const getAvailableTeachers = async (req, res) => {
  res.json({
    success: true,
    message: 'Chat endpoints will be implemented in Phase 5',
    data: { teachers: [] }
  });
};

export const requestTeacherChat = async (req, res) => {
  res.json({
    success: true,
    message: 'Chat endpoints will be implemented in Phase 5'
  });
};

export const endChatSession = async (req, res) => {
  res.json({
    success: true,
    message: 'Chat endpoints will be implemented in Phase 5'
  });
};

// Mark messages as read
export const markMessagesRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { messageIds } = req.body;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(p => 
      p.user.toString() === userId && p.isActive
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    // Mark messages as read
    messageIds.forEach(messageId => {
      const message = chat.messages.id(messageId);
      if (message) {
        const existingRead = message.readBy.find(r => r.user.toString() === userId);
        if (!existingRead) {
          message.readBy.push({ user: userId, readAt: new Date() });
        }
      }
    });

    await chat.save();

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
};

// Add participant to chat
export const addParticipant = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId, role = 'member' } = req.body;
    const requesterId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if requester is admin or owner
    const requesterParticipant = chat.participants.find(p => 
      p.user.toString() === requesterId && p.isActive
    );

    if (!requesterParticipant || !['admin', 'owner'].includes(requesterParticipant.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can add participants'
      });
    }

    // Check if user is already a participant
    const existingParticipant = chat.participants.find(p => 
      p.user.toString() === userId
    );

    if (existingParticipant) {
      if (existingParticipant.isActive) {
        return res.status(400).json({
          success: false,
          message: 'User is already a participant'
        });
      } else {
        // Reactivate participant
        existingParticipant.isActive = true;
        existingParticipant.joinedAt = new Date();
      }
    } else {
      // Add new participant
      chat.participants.push({
        user: userId,
        role,
        isActive: true,
        joinedAt: new Date()
      });
    }

    await chat.save();
    await chat.populate('participants.user', 'firstName lastName avatar');

    res.status(200).json({
      success: true,
      message: 'Participant added successfully',
      data: { chat }
    });
  } catch (error) {
    console.error('Add participant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add participant',
      error: error.message
    });
  }
};

// Remove participant from chat
export const removeParticipant = async (req, res) => {
  try {
    const { chatId, userId } = req.params;
    const requesterId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if requester is admin or owner
    const requesterParticipant = chat.participants.find(p => 
      p.user.toString() === requesterId && p.isActive
    );

    if (!requesterParticipant || !['admin', 'owner'].includes(requesterParticipant.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can remove participants'
      });
    }

    // Find and deactivate participant
    const participant = chat.participants.find(p => 
      p.user.toString() === userId && p.isActive
    );

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    participant.isActive = false;
    participant.leftAt = new Date();

    await chat.save();

    res.status(200).json({
      success: true,
      message: 'Participant removed successfully'
    });
  } catch (error) {
    console.error('Remove participant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove participant',
      error: error.message
    });
  }
};
