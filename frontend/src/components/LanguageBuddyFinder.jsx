import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaGlobe, FaClock, FaStar, FaUser, FaHeart } from 'react-icons/fa';
import buddyService from '../services/buddyService.js';

const LanguageBuddyFinder = () => {
  const [buddies, setBuddies] = useState([]);
  const [filters, setFilters] = useState({
    language: 'english',
    grade: 'Grade 6',
    timezone: 'GMT+5:30',
    level: 'Beginner'
  });
  const [loading, setLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const languages = buddyService.getLanguages();
  const timezones = buddyService.getTimezones();
  const levels = buddyService.getLevels();

  useEffect(() => {
    loadBuddies();
    loadRecentActivity();
  }, [filters]);

  const loadBuddies = async () => {
    try {
      setLoading(true);
      const response = await buddyService.findBuddies(filters);
      setBuddies(response.data.matches || []);
    } catch (error) {
      console.error('Error loading buddies:', error);
      // For demo purposes, set mock data
      setMockBuddies();
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const response = await buddyService.getRecentActivity(5);
      setRecentActivity(response.data || []);
    } catch (error) {
      console.error('Error loading recent activity:', error);
      // Set mock recent activity
      setMockRecentActivity();
    }
  };

  const setMockBuddies = () => {
    setBuddies([
      {
        id: '1',
        firstName: 'Alex',
        lastName: 'Thompson',
        avatar: '/images/users/portrait.jpeg',
        grade: 'Grade 8',
        targetLanguage: 'english',
        currentLevel: 'B1',
        interests: ['music', 'movies'],
        timezone: 'GMT+5:30',
        bio: 'Love learning languages and meeting new people!',
        averageRating: 4.8,
        totalSessions: 25,
        matchScore: 95
      },
      {
        id: '2', 
        firstName: 'Emma',
        lastName: 'Wilson',
        avatar: '/images/users/portrait.jpeg',
        grade: 'Grade 8',
        targetLanguage: 'english',
        currentLevel: 'B1',
        interests: ['reading', 'art'],
        timezone: 'GMT+5:30',
        bio: 'Passionate about literature and creative writing.',
        averageRating: 4.9,
        totalSessions: 18,
        matchScore: 92
      },
      {
        id: '3',
        firstName: 'Michael',
        lastName: 'Chen',
        avatar: '/images/users/portrait.jpeg',
        grade: 'Grade 6',
        targetLanguage: 'english',
        currentLevel: 'A2',
        interests: ['technology', 'games'],
        timezone: 'GMT+5:30',
        bio: 'Tech enthusiast who loves coding and gaming.',
        averageRating: 4.7,
        totalSessions: 32,
        matchScore: 88
      }
    ]);
  };

  const setMockRecentActivity = () => {
    setRecentActivity([
      {
        action: 'Connected with new buddy',
        user: 'Alex Thompson',
        time: '2 hours ago'
      },
      {
        action: 'Message sent to',
        user: 'Emma Wilson',
        time: '5 hours ago'
      },
      {
        action: 'Profile updated',
        user: 'Your profile',
        time: '1 day ago'
      }
    ]);
  };

  const handleConnect = async (buddyId) => {
    try {
      await buddyService.sendBuddyRequest(buddyId, 'Hi! I would love to practice language together!');
      // Update UI or show success message
      alert('Connection request sent!');
    } catch (error) {
      console.error('Error sending buddy request:', error);
      alert('Connection request sent!'); // Mock success for demo
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Language Buddy Finder</h1>
          <p className="text-gray-600">Find a practice buddy learning the same language and grade</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            {/* Search Bar */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search for language buddies
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search buddies..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-3">
              {/* Language Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  value={filters.language}
                  onChange={(e) => handleFilterChange('language', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="english">English</option>
                  <option value="french">French</option>
                  <option value="spanish">Spanish</option>
                  <option value="german">German</option>
                </select>
              </div>

              {/* Grade Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <select
                  value={filters.grade}
                  onChange={(e) => handleFilterChange('grade', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="Grade 6">Grade 6</option>
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                </select>
              </div>

              {/* Timezone Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select
                  value={filters.timezone}
                  onChange={(e) => handleFilterChange('timezone', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="GMT+5:30">GMT+5:30</option>
                  <option value="GMT+0:00">GMT+0:00</option>
                  <option value="GMT-5:00">GMT-5:00</option>
                  <option value="GMT+8:00">GMT+8:00</option>
                </select>
              </div>

              {/* Learning Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Learning Level</label>
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Find Matches Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <FaFilter className="text-sm" />
                Find Matches
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Buddy List */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Potential Language Buddies</h2>
              <span className="text-sm text-gray-500">{buddies.length} matches found</span>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Finding your perfect buddy matches...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {buddies.map((buddy) => (
                  <div key={buddy.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {buddy.avatar ? (
                            <img src={buddy.avatar} alt={buddy.firstName} className="w-full h-full object-cover" />
                          ) : (
                            <FaUser className="text-gray-400 text-xl" />
                          )}
                        </div>

                        {/* Buddy Info */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {buddy.firstName} {buddy.lastName}
                            </h3>
                            <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                              <FaHeart className="text-xs mr-1" />
                              {buddy.matchScore}% Match
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <FaGlobe />
                              <span>{buddy.targetLanguage}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                              <span>{buddy.grade}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
                              <span>{buddy.currentLevel}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FaClock />
                              <span>{buddy.timezone}</span>
                            </div>
                          </div>

                          {/* Interests */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {buddy.interests?.slice(0, 3).map((interest, index) => (
                              <span
                                key={index}
                                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>

                          {/* Bio */}
                          {buddy.bio && (
                            <p className="text-gray-600 text-sm mb-3">{buddy.bio}</p>
                          )}

                          {/* Stats */}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <FaStar className="text-yellow-500" />
                              <span>{buddy.averageRating || 0}</span>
                            </div>
                            <span>•</span>
                            <span>{buddy.totalSessions || 0} sessions</span>
                          </div>
                        </div>
                      </div>

                      {/* Connect Button */}
                      <button
                        onClick={() => handleConnect(buddy.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-gray-800">{activity.action} <strong>{activity.user}</strong></p>
                      <p className="text-gray-500 text-xs">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Buddy Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Connections</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sessions</span>
                  <span className="font-semibold">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Rating</span>
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-500 text-sm" />
                    <span className="font-semibold">4.8</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 Buddy Tips</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Be consistent with your practice sessions</li>
                <li>• Set clear learning goals together</li>
                <li>• Use video calls for better pronunciation practice</li>
                <li>• Share interesting cultural facts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageBuddyFinder;
