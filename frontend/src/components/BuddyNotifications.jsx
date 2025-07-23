import React, { useState, useEffect } from 'react';
import { FaBell, FaUser, FaCheck, FaTimes, FaComment } from 'react-icons/fa';
import buddyService from '../services/buddyService.js';

const BuddyNotifications = ({ onNotificationClick }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    // Set up polling for new notifications
    const interval = setInterval(loadNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const [connectionsResponse, activityResponse] = await Promise.all([
        buddyService.getBuddyConnections(),
        buddyService.getRecentActivity(5)
      ]);

      const pendingRequests = connectionsResponse.data.received || [];
      const recentActivity = activityResponse.data || [];

      // Create notifications from pending requests
      const requestNotifications = pendingRequests.map(request => ({
        id: `request_${request._id}`,
        type: 'buddy_request',
        title: 'New Buddy Request',
        message: `${request.requester.firstName} ${request.requester.lastName} wants to be your language buddy`,
        user: request.requester,
        timestamp: new Date(request.requestedAt),
        unread: true,
        connectionId: request._id
      }));

      // Create notifications from recent activity
      const activityNotifications = recentActivity
        .filter(activity => activity.action !== 'sent_request') // Don't notify about own actions
        .map(activity => ({
          id: `activity_${activity.id}`,
          type: 'activity',
          title: getActivityTitle(activity.action),
          message: getActivityMessage(activity),
          user: activity.otherUser,
          timestamp: new Date(activity.timestamp),
          unread: true,
          connectionId: activity.id
        }));

      const allNotifications = [...requestNotifications, ...activityNotifications]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10); // Keep only latest 10

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => n.unread).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Set mock notifications for demo
      setMockNotifications();
    }
  };

  const setMockNotifications = () => {
    const mockNotifications = [
      {
        id: 'mock_1',
        type: 'buddy_request',
        title: 'New Buddy Request',
        message: 'Alex Thompson wants to be your language buddy',
        user: {
          firstName: 'Alex',
          lastName: 'Thompson',
          avatar: '/images/users/portrait.jpeg'
        },
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        unread: true,
        connectionId: 'mock_connection_1'
      },
      {
        id: 'mock_2',
        type: 'activity',
        title: 'Message Received',
        message: 'Emma Wilson sent you a message',
        user: {
          firstName: 'Emma',
          lastName: 'Wilson',
          avatar: '/images/users/portrait.jpeg'
        },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        unread: true,
        connectionId: 'mock_connection_2'
      },
      {
        id: 'mock_3',
        type: 'activity',
        title: 'Connection Accepted',
        message: 'Michael Chen accepted your buddy request',
        user: {
          firstName: 'Michael',
          lastName: 'Chen',
          avatar: '/images/users/portrait.jpeg'
        },
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        unread: false,
        connectionId: 'mock_connection_3'
      }
    ];
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => n.unread).length);
  };

  const getActivityTitle = (action) => {
    switch (action) {
      case 'connection_accepted':
        return 'Connection Accepted';
      case 'message_sent':
        return 'Message Received';
      case 'session_started':
        return 'Practice Session Started';
      case 'goal_completed':
        return 'Goal Completed';
      default:
        return 'Buddy Activity';
    }
  };

  const getActivityMessage = (activity) => {
    switch (activity.action) {
      case 'connection_accepted':
        return `${activity.otherUser.firstName} accepted your buddy request`;
      case 'message_sent':
        return `${activity.otherUser.firstName} sent you a message`;
      case 'session_started':
        return `${activity.otherUser.firstName} started a practice session`;
      case 'goal_completed':
        return `${activity.otherUser.firstName} completed a learning goal`;
      default:
        return `${activity.otherUser.firstName} has new activity`;
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, unread: false } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // Close dropdown
    setShowDropdown(false);
    
    // Handle notification action
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const handleQuickAction = async (notification, action, event) => {
    event.stopPropagation();
    
    if (notification.type === 'buddy_request') {
      try {
        await buddyService.respondToBuddyRequest(notification.connectionId, action);
        // Remove notification after action
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error responding to request:', error);
        // For demo, just remove the notification
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-y-auto">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600">{unreadCount} unread</p>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition ${
                      notification.unread ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {notification.user.avatar ? (
                          <img 
                            src={notification.user.avatar} 
                            alt={notification.user.firstName} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <FaUser className="text-gray-400" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-1">
                            {notification.unread && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>

                        {/* Quick Actions for Buddy Requests */}
                        {notification.type === 'buddy_request' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => handleQuickAction(notification, 'accept', e)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition flex items-center gap-1"
                            >
                              <FaCheck className="text-xs" />
                              Accept
                            </button>
                            <button
                              onClick={(e) => handleQuickAction(notification, 'decline', e)}
                              className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition flex items-center gap-1"
                            >
                              <FaTimes className="text-xs" />
                              Decline
                            </button>
                          </div>
                        )}

                        {/* Quick Actions for Messages */}
                        {notification.type === 'activity' && notification.title === 'Message Received' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle reply action
                              alert('Opening chat...');
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition flex items-center gap-1"
                          >
                            <FaComment className="text-xs" />
                            Reply
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <FaBell className="text-3xl text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No notifications yet</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 text-center">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // Navigate to full notifications page
                    if (onNotificationClick) {
                      onNotificationClick({ type: 'view_all' });
                    }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BuddyNotifications;
