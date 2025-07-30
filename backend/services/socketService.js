import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Chat from '../models/Chat.js';

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId
    this.activeRooms = new Map(); // roomId -> Set of userIds
  }

  // Initialize Socket.io server
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    console.log('Socket.io server initialized');
  }

  // Setup authentication middleware
  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  // Setup event handlers
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.user.firstName} connected: ${socket.id}`);

      this.handleUserConnection(socket);
      this.setupChatHandlers(socket);
      this.setupRoomHandlers(socket);
      this.setupTypingHandlers(socket);
      this.setupVideoHandlers(socket);
      this.setupDisconnection(socket);
    });
  }

  // Handle user connection
  handleUserConnection(socket) {
    const userId = socket.userId;
    
    // Store user connection
    this.connectedUsers.set(userId, socket.id);
    this.userSockets.set(socket.id, userId);
    
    // Update user online status
    this.updateUserOnlineStatus(userId, true);
    
    // Join user to their chat rooms
    this.joinUserRooms(socket);
    
    // Notify contacts that user is online
    this.notifyUserOnline(userId);
  }

  // Join user to their chat rooms
  async joinUserRooms(socket) {
    try {
      const userChats = await Chat.find({
        'participants.user': socket.userId,
        'participants.isActive': true,
        isActive: true
      });

      userChats.forEach(chat => {
        const roomId = chat._id.toString();
        socket.join(roomId);
        
        // Add user to active room tracking
        if (!this.activeRooms.has(roomId)) {
          this.activeRooms.set(roomId, new Set());
        }
        this.activeRooms.get(roomId).add(socket.userId);
        
        console.log(`User ${socket.user.firstName} joined room: ${roomId}`);
      });
    } catch (error) {
      console.error('Error joining user rooms:', error);
    }
  }

  // Setup chat message handlers
  setupChatHandlers(socket) {
    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, type = 'text', attachments = [] } = data;
        
        // Validate chat access
        const chat = await Chat.findById(chatId);
        if (!chat || !this.isUserInChat(chat, socket.userId)) {
          socket.emit('error', { message: 'Access denied to this chat' });
          return;
        }

        // Create message
        const message = {
          sender: socket.userId,
          content,
          type,
          attachments,
          timestamp: new Date(),
          readBy: [{ user: socket.userId, readAt: new Date() }]
        };

        // Add message to chat
        chat.messages.push(message);
        chat.lastMessage = message;
        chat.lastActivity = new Date();
        await chat.save();

        // Populate sender info
        await chat.populate('messages.sender', 'firstName lastName avatar');
        const populatedMessage = chat.messages[chat.messages.length - 1];

        // Emit to all participants in the room
        this.io.to(chatId).emit('new_message', {
          chatId,
          message: populatedMessage
        });

        // Send push notifications to offline users
        this.sendOfflineNotifications(chat, populatedMessage, socket.userId);

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Mark messages as read
    socket.on('mark_read', async (data) => {
      try {
        const { chatId, messageIds } = data;
        
        const chat = await Chat.findById(chatId);
        if (!chat || !this.isUserInChat(chat, socket.userId)) {
          return;
        }

        // Mark messages as read
        let updated = false;
        chat.messages.forEach(message => {
          if (messageIds.includes(message._id.toString())) {
            const existingRead = message.readBy.find(r => r.user.toString() === socket.userId);
            if (!existingRead) {
              message.readBy.push({ user: socket.userId, readAt: new Date() });
              updated = true;
            }
          }
        });

        if (updated) {
          await chat.save();
          
          // Notify other participants about read status
          socket.to(chatId).emit('messages_read', {
            chatId,
            messageIds,
            readBy: socket.userId
          });
        }

      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    // Delete message
    socket.on('delete_message', async (data) => {
      try {
        const { chatId, messageId } = data;
        
        const chat = await Chat.findById(chatId);
        if (!chat || !this.isUserInChat(chat, socket.userId)) {
          return;
        }

        const message = chat.messages.id(messageId);
        if (!message) {
          return;
        }

        // Check if user can delete (sender or admin)
        const userRole = this.getUserRoleInChat(chat, socket.userId);
        if (message.sender.toString() !== socket.userId && userRole !== 'admin') {
          socket.emit('error', { message: 'Cannot delete this message' });
          return;
        }

        // Soft delete
        message.isDeleted = true;
        message.deletedAt = new Date();
        message.deletedBy = socket.userId;
        await chat.save();

        // Notify all participants
        this.io.to(chatId).emit('message_deleted', {
          chatId,
          messageId,
          deletedBy: socket.userId
        });

      } catch (error) {
        console.error('Delete message error:', error);
      }
    });

    // Edit message
    socket.on('edit_message', async (data) => {
      try {
        const { chatId, messageId, newContent } = data;
        
        const chat = await Chat.findById(chatId);
        if (!chat || !this.isUserInChat(chat, socket.userId)) {
          return;
        }

        const message = chat.messages.id(messageId);
        if (!message || message.sender.toString() !== socket.userId) {
          socket.emit('error', { message: 'Cannot edit this message' });
          return;
        }

        // Edit message
        message.originalContent = message.content;
        message.content = newContent;
        message.isEdited = true;
        message.editedAt = new Date();
        await chat.save();

        // Notify all participants
        this.io.to(chatId).emit('message_edited', {
          chatId,
          messageId,
          newContent,
          editedAt: message.editedAt
        });

      } catch (error) {
        console.error('Edit message error:', error);
      }
    });
  }

  // Setup room handlers
  setupRoomHandlers(socket) {
    // Join specific room
    socket.on('join_room', async (data) => {
      try {
        const { chatId } = data;
        
        const chat = await Chat.findById(chatId);
        if (!chat || !this.isUserInChat(chat, socket.userId)) {
          socket.emit('error', { message: 'Access denied to this chat' });
          return;
        }

        socket.join(chatId);
        
        // Add to active room tracking
        if (!this.activeRooms.has(chatId)) {
          this.activeRooms.set(chatId, new Set());
        }
        this.activeRooms.get(chatId).add(socket.userId);

        // Notify others that user joined
        socket.to(chatId).emit('user_joined_room', {
          chatId,
          userId: socket.userId,
          user: {
            _id: socket.user._id,
            firstName: socket.user.firstName,
            lastName: socket.user.lastName,
            avatar: socket.user.avatar
          }
        });

      } catch (error) {
        console.error('Join room error:', error);
      }
    });

    // Leave room
    socket.on('leave_room', (data) => {
      const { chatId } = data;
      
      socket.leave(chatId);
      
      // Remove from active room tracking
      if (this.activeRooms.has(chatId)) {
        this.activeRooms.get(chatId).delete(socket.userId);
        if (this.activeRooms.get(chatId).size === 0) {
          this.activeRooms.delete(chatId);
        }
      }

      // Notify others that user left
      socket.to(chatId).emit('user_left_room', {
        chatId,
        userId: socket.userId
      });
    });
  }

  // Setup typing indicators
  setupTypingHandlers(socket) {
    socket.on('typing_start', (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('user_typing', {
        chatId,
        userId: socket.userId,
        user: {
          firstName: socket.user.firstName,
          lastName: socket.user.lastName
        }
      });
    });

    socket.on('typing_stop', (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('user_stopped_typing', {
        chatId,
        userId: socket.userId
      });
    });
  }

  // Setup video handlers
  setupVideoHandlers(socket) {
    // Join video room
    socket.on('join_video_room', async (data) => {
      const { roomId, userId, mediaState } = data;
      
      // Add room-specific identifier to avoid conflicts
      const videoRoomId = `video_${roomId}`;
      socket.join(videoRoomId);

      // Keep track of participants in video room
      if (!this.activeRooms.has(videoRoomId)) {
        this.activeRooms.set(videoRoomId, new Set());
      }
      this.activeRooms.get(videoRoomId).add(socket.userId);

      // Get current users in the room
      const roomParticipants = Array.from(this.activeRooms.get(videoRoomId))
        .filter(id => id !== socket.userId);

      // Send existing participants to the new user
      socket.emit('video_room_participants', {
        participants: roomParticipants,
      });

      // Notify others in the room about the new participant
      socket.to(videoRoomId).emit('user_joined_video', {
        userId: socket.userId,
        mediaState
      });

      console.log(`User ${socket.user.firstName} joined video room: ${roomId} (${this.activeRooms.get(videoRoomId).size} participants)`);
    });

    // Leave video room
    socket.on('leave_video_room', (data) => {
      const { roomId } = data;
      const videoRoomId = `video_${roomId}`;

      // Remove user from tracking
      if (this.activeRooms.has(videoRoomId)) {
        this.activeRooms.get(videoRoomId).delete(socket.userId);
        
        // Clean up empty rooms
        if (this.activeRooms.get(videoRoomId).size === 0) {
          this.activeRooms.delete(videoRoomId);
        }
      }

      socket.leave(videoRoomId);

      // Notify others in the room
      socket.to(videoRoomId).emit('user_left_video', {
        userId: socket.userId
      });

      console.log(`User ${socket.user.firstName} left video room: ${roomId}`);
    });

    // WebRTC signaling
    socket.on('video_offer', (data) => {
      const { roomId, targetUserId, offer } = data;

      const targetSocketId = this.connectedUsers.get(targetUserId);
      if (targetSocketId) {
        this.io.to(targetSocketId).emit('video_offer', {
          fromUserId: socket.userId,
          offer
        });
      }
    });

    socket.on('video_answer', (data) => {
      const { roomId, targetUserId, answer } = data;

      const targetSocketId = this.connectedUsers.get(targetUserId);
      if (targetSocketId) {
        this.io.to(targetSocketId).emit('video_answer', {
          fromUserId: socket.userId,
          answer
        });
      }
    });

    socket.on('ice_candidate', (data) => {
      const { roomId, targetUserId, candidate } = data;

      const targetSocketId = this.connectedUsers.get(targetUserId);
      if (targetSocketId) {
        this.io.to(targetSocketId).emit('ice_candidate', {
          fromUserId: socket.userId,
          candidate
        });
      }
    });

    // Media state changes
    socket.on('video_state_changed', (data) => {
      const { roomId, mediaState } = data;

      socket.to(`video_${roomId}`).emit('video_state_changed', {
        userId: socket.userId,
        mediaState
      });
    });

    // Screen sharing
    socket.on('screen_share_started', (data) => {
      const { roomId } = data;

      socket.to(`video_${roomId}`).emit('screen_share_started', {
        userId: socket.userId
      });
    });

    socket.on('screen_share_stopped', (data) => {
      const { roomId } = data;

      socket.to(`video_${roomId}`).emit('screen_share_stopped', {
        userId: socket.userId
      });
    });
  }

  // Setup disconnection handler
  setupDisconnection(socket) {
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.firstName} disconnected: ${socket.id}`);

      const userId = socket.userId;

      // Remove from tracking
      this.connectedUsers.delete(userId);
      this.userSockets.delete(socket.id);

      // Remove from active rooms
      this.activeRooms.forEach((users, roomId) => {
        users.delete(userId);
        if (users.size === 0) {
          this.activeRooms.delete(roomId);
        }
      });

      // Update user offline status (with delay for reconnection)
      setTimeout(() => {
        if (!this.connectedUsers.has(userId)) {
          this.updateUserOnlineStatus(userId, false);
          this.notifyUserOffline(userId);
        }
      }, 5000);
    });
  }

  // Helper methods
  isUserInChat(chat, userId) {
    return chat.participants.some(p => 
      p.user.toString() === userId && p.isActive
    );
  }

  getUserRoleInChat(chat, userId) {
    const participant = chat.participants.find(p => 
      p.user.toString() === userId && p.isActive
    );
    return participant ? participant.role : null;
  }

  async updateUserOnlineStatus(userId, isOnline) {
    try {
      await User.findByIdAndUpdate(userId, {
        isOnline,
        lastSeen: new Date()
      });
    } catch (error) {
      console.error('Update online status error:', error);
    }
  }

  notifyUserOnline(userId) {
    // Notify user's contacts that they're online
    this.io.emit('user_online', { userId });
  }

  notifyUserOffline(userId) {
    // Notify user's contacts that they're offline
    this.io.emit('user_offline', { userId });
  }

  async sendOfflineNotifications(chat, message, senderId) {
    // Implementation for push notifications to offline users
    // This would integrate with a notification service
    console.log('Sending offline notifications for chat:', chat._id);
  }

  // Public methods for external use
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  sendToRoom(roomId, event, data) {
    this.io.to(roomId).emit(event, data);
  }

  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  getActiveUsersInRoom(roomId) {
    return this.activeRooms.get(roomId) || new Set();
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;
