import { io } from 'socket.io-client';
import apiService from './api.js';

class ChatService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventListeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  // Initialize socket connection
  connect(token) {
    if (this.socket) {
      this.disconnect();
    }

    const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.setupEventHandlers();
    return this.socket;
  }

  // Setup socket event handlers
  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from chat server:', reason);
      this.isConnected = false;
      this.emit('connection_status', { connected: false, reason });
      
      // Auto-reconnect for certain disconnect reasons
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect
        return;
      }
      
      this.attemptReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.emit('connection_error', { error: error.message });
      this.attemptReconnect();
    });

    // Chat event handlers
    this.socket.on('new_message', (data) => {
      this.emit('new_message', data);
    });

    this.socket.on('message_edited', (data) => {
      this.emit('message_edited', data);
    });

    this.socket.on('message_deleted', (data) => {
      this.emit('message_deleted', data);
    });

    this.socket.on('messages_read', (data) => {
      this.emit('messages_read', data);
    });

    this.socket.on('user_typing', (data) => {
      this.emit('user_typing', data);
    });

    this.socket.on('user_stopped_typing', (data) => {
      this.emit('user_stopped_typing', data);
    });

    this.socket.on('user_joined_room', (data) => {
      this.emit('user_joined_room', data);
    });

    this.socket.on('user_left_room', (data) => {
      this.emit('user_left_room', data);
    });

    this.socket.on('user_online', (data) => {
      this.emit('user_online', data);
    });

    this.socket.on('user_offline', (data) => {
      this.emit('user_offline', data);
    });

    this.socket.on('new_chat_created', (data) => {
      this.emit('new_chat_created', data);
    });

    this.socket.on('participant_added', (data) => {
      this.emit('participant_added', data);
    });

    this.socket.on('participant_removed', (data) => {
      this.emit('participant_removed', data);
    });

    this.socket.on('error', (data) => {
      console.error('Socket error:', data);
      this.emit('error', data);
    });
  }

  // Attempt to reconnect
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts_reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      if (this.socket) {
        this.socket.connect();
      }
    }, delay);
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Socket operations
  joinRoom(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_room', { chatId });
    }
  }

  leaveRoom(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_room', { chatId });
    }
  }

  sendMessage(chatId, content, type = 'text', attachments = []) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        chatId,
        content,
        type,
        attachments
      });
    }
  }

  markMessagesRead(chatId, messageIds) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_read', {
        chatId,
        messageIds
      });
    }
  }

  editMessage(chatId, messageId, newContent) {
    if (this.socket && this.isConnected) {
      this.socket.emit('edit_message', {
        chatId,
        messageId,
        newContent
      });
    }
  }

  deleteMessage(chatId, messageId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('delete_message', {
        chatId,
        messageId
      });
    }
  }

  startTyping(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', { chatId });
    }
  }

  stopTyping(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', { chatId });
    }
  }

  // HTTP API methods
  async getUserChats(userId) {
    try {
      const response = await apiService.get(`/chat/user/${userId}/chats`);
      return response;
    } catch (error) {
      console.error('Get user chats error:', error);
      throw error;
    }
  }

  async createChat(chatData) {
    try {
      const response = await apiService.post('/chat/create', chatData);
      return response;
    } catch (error) {
      console.error('Create chat error:', error);
      throw error;
    }
  }

  async getChatMessages(chatId, page = 1, limit = 50) {
    try {
      const response = await apiService.get(`/chat/${chatId}/messages`, {
        params: { page, limit }
      });
      return response;
    } catch (error) {
      console.error('Get chat messages error:', error);
      throw error;
    }
  }

  async sendMessageHttp(chatId, messageData) {
    try {
      const response = await apiService.post(`/chat/${chatId}/message`, messageData);
      return response;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  async markMessagesReadHttp(chatId, messageIds) {
    try {
      const response = await apiService.post(`/chat/${chatId}/read`, { messageIds });
      return response;
    } catch (error) {
      console.error('Mark messages read error:', error);
      throw error;
    }
  }

  async addParticipant(chatId, userId, role = 'member') {
    try {
      const response = await apiService.post(`/chat/${chatId}/participants`, {
        userId,
        role
      });
      return response;
    } catch (error) {
      console.error('Add participant error:', error);
      throw error;
    }
  }

  async removeParticipant(chatId, userId) {
    try {
      const response = await apiService.delete(`/chat/${chatId}/participants/${userId}`);
      return response;
    } catch (error) {
      console.error('Remove participant error:', error);
      throw error;
    }
  }

  // Utility methods
  isConnected() {
    return this.isConnected && this.socket?.connected;
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Message formatting helpers
  formatMessage(message) {
    return {
      ...message,
      timestamp: new Date(message.timestamp),
      isOwn: message.sender._id === this.currentUserId,
      formattedTime: this.formatTime(message.timestamp)
    };
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  }

  // Typing indicator management
  setupTypingIndicator(chatId, inputElement) {
    let typingTimer;
    let isTyping = false;

    const startTyping = () => {
      if (!isTyping) {
        this.startTyping(chatId);
        isTyping = true;
      }
      
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        this.stopTyping(chatId);
        isTyping = false;
      }, 3000);
    };

    const stopTyping = () => {
      clearTimeout(typingTimer);
      if (isTyping) {
        this.stopTyping(chatId);
        isTyping = false;
      }
    };

    inputElement.addEventListener('input', startTyping);
    inputElement.addEventListener('blur', stopTyping);

    return () => {
      inputElement.removeEventListener('input', startTyping);
      inputElement.removeEventListener('blur', stopTyping);
      stopTyping();
    };
  }
}

// Create singleton instance
const chatService = new ChatService();
export default chatService;
