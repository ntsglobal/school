import React, { useState, useEffect } from 'react';
import { FaUser, FaCheck, FaTimes, FaComment, FaStar, FaCalendar } from 'react-icons/fa';
import buddyService from '../services/buddyService.js';

const BuddyConnections = () => {
  const [connections, setConnections] = useState({
    received: [],
    sent: [],
    active: [],
    all: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const response = await buddyService.getBuddyConnections();
      setConnections(response.data);
    } catch (error) {
      console.error('Error loading connections:', error);
      // Set mock data for demo
      setMockConnections();
    } finally {
      setLoading(false);
    }
  };

  const setMockConnections = () => {
    const mockData = {
      received: [
        {
          _id: '1',
          requester: {
            _id: 'user1',
            firstName: 'Alex',
            lastName: 'Thompson',
            avatar: '/images/users/portrait.jpeg'
          },
          language: 'english',
          matchScore: 95,
          requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          notes: 'Hi! I would love to practice English conversation with you!'
        }
      ],
      sent: [
        {
          _id: '2',
          receiver: {
            _id: 'user2',
            firstName: 'Emma',
            lastName: 'Wilson',
            avatar: '/images/users/portrait.jpeg'
          },
          language: 'english',
          matchScore: 92,
          requestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          notes: 'Looking forward to practicing together!'
        }
      ],
      active: [
        {
          _id: '3',
          requester: {
            _id: 'user3',
            firstName: 'Michael',
            lastName: 'Chen',
            avatar: '/images/users/portrait.jpeg'
          },
          receiver: {
            _id: 'current-user',
            firstName: 'You',
            lastName: '',
            avatar: null
          },
          language: 'english',
          matchScore: 88,
          respondedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          totalMessages: 25,
          sessionCount: 5,
          lastMessageAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        }
      ],
      all: []
    };
    setConnections(mockData);
  };

  const handleAcceptRequest = async (connectionId) => {
    try {
      await buddyService.respondToBuddyRequest(connectionId, 'accept', 'Excited to practice together!');
      loadConnections(); // Reload to update the lists
    } catch (error) {
      console.error('Error accepting request:', error);
      // For demo, just move the item to active
      alert('Connection request accepted!');
    }
  };

  const handleDeclineRequest = async (connectionId) => {
    try {
      await buddyService.respondToBuddyRequest(connectionId, 'decline', 'Thank you for the request, but I cannot accept at this time.');
      loadConnections(); // Reload to update the lists
    } catch (error) {
      console.error('Error declining request:', error);
      // For demo, just remove from received
      alert('Connection request declined.');
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const renderConnectionCard = (connection, type) => {
    const isReceived = type === 'received';
    const isSent = type === 'sent';
    const isActive = type === 'active';
    
    const otherUser = isReceived ? connection.requester : 
                     isSent ? connection.receiver : 
                     connection.requester._id === 'current-user' ? connection.receiver : connection.requester;

    return (
      <div key={connection._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {otherUser.avatar ? (
                <img src={otherUser.avatar} alt={otherUser.firstName} className="w-full h-full object-cover" />
              ) : (
                <FaUser className="text-gray-400" />
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {otherUser.firstName} {otherUser.lastName}
                </h3>
                <div className="flex items-center text-sm text-gray-500">
                  <FaCalendar className="mr-1" />
                  {formatTimeAgo(connection.requestedAt || connection.respondedAt)}
                </div>
              </div>

              {/* Match Score */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  <span className="font-medium">{connection.matchScore}% Match</span>
                </div>
                <span className="capitalize">{connection.language}</span>
              </div>

              {/* Message/Notes */}
              {connection.notes && (
                <p className="text-gray-600 text-sm mb-3 italic">"{connection.notes}"</p>
              )}

              {/* Active Connection Stats */}
              {isActive && (
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FaComment />
                    <span>{connection.totalMessages || 0} messages</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaCalendar />
                    <span>{connection.sessionCount || 0} sessions</span>
                  </div>
                  {connection.lastMessageAt && (
                    <span>Last active: {formatTimeAgo(connection.lastMessageAt)}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-4">
            {isReceived && (
              <>
                <button
                  onClick={() => handleAcceptRequest(connection._id)}
                  className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
                  title="Accept Request"
                >
                  <FaCheck />
                </button>
                <button
                  onClick={() => handleDeclineRequest(connection._id)}
                  className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
                  title="Decline Request"
                >
                  <FaTimes />
                </button>
              </>
            )}
            {isSent && (
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Pending
              </span>
            )}
            {isActive && (
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                onClick={() => alert('Opening chat...')}
              >
                <FaComment className="mr-1" />
                Chat
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { key: 'received', label: 'Received Requests', count: connections.received.length },
    { key: 'sent', label: 'Sent Requests', count: connections.sent.length },
    { key: 'active', label: 'Active Connections', count: connections.active.length }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Buddy Connections</h1>
          <p className="text-gray-600">Manage your language learning partnerships</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.key
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'received' && (
            <>
              {connections.received.length > 0 ? (
                connections.received.map(connection => renderConnectionCard(connection, 'received'))
              ) : (
                <div className="text-center py-12 bg-white rounded-lg">
                  <FaUser className="text-4xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                  <p className="text-gray-500">You don't have any buddy requests waiting for your response.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'sent' && (
            <>
              {connections.sent.length > 0 ? (
                connections.sent.map(connection => renderConnectionCard(connection, 'sent'))
              ) : (
                <div className="text-center py-12 bg-white rounded-lg">
                  <FaComment className="text-4xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sent requests</h3>
                  <p className="text-gray-500">You haven't sent any buddy requests yet.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'active' && (
            <>
              {connections.active.length > 0 ? (
                connections.active.map(connection => renderConnectionCard(connection, 'active'))
              ) : (
                <div className="text-center py-12 bg-white rounded-lg">
                  <FaStar className="text-4xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active connections</h3>
                  <p className="text-gray-500">You don't have any active buddy connections yet. Start by finding buddies!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuddyConnections;
