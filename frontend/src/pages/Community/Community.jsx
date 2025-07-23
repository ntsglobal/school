import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './Community.css';

const Community = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discussions');
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  useEffect(() => {
    // Simulate loading community data
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Community Statistics
  const communityStats = {
    members: '5,000+',
    languages: '8',
    discussions: '100+',
    posts: '2,500+'
  };

  // Language Forums Data
  const languageForums = [
    {
      id: 'japanese',
      name: 'Japanese',
      flag: '🇯🇵',
      members: 1200,
      posts: 450,
      description: 'Learn and practice Japanese with native speakers'
    },
    {
      id: 'french',
      name: 'French',
      flag: '🇫🇷',
      members: 800,
      posts: 320,
      description: 'Discuss French culture and language'
    },
    {
      id: 'german',
      name: 'German',
      flag: '🇩🇪',
      members: 650,
      posts: 280,
      description: 'German language learning community'
    },
    {
      id: 'spanish',
      name: 'Spanish',
      flag: '🇪🇸',
      members: 900,
      posts: 380,
      description: 'Spanish conversation and culture'
    },
    {
      id: 'korean',
      name: 'Korean',
      flag: '🇰🇷',
      members: 700,
      posts: 250,
      description: 'Korean language and K-culture discussions'
    }
  ];

  // Active Discussions
  const activeDiscussions = [
    {
      id: 1,
      title: 'Tips for mastering Japanese pronunciation',
      author: 'Sarah Kim',
      avatar: '/api/placeholder/40/40',
      language: 'Japanese',
      replies: 24,
      time: '2 hours ago',
      isHot: true
    },
    {
      id: 2,
      title: 'German vs Dutch: Key differences in grammar',
      author: 'Alex Mueller',
      avatar: '/api/placeholder/40/40',
      language: 'German',
      replies: 18,
      time: '4 hours ago',
      isHot: false
    },
    {
      id: 3,
      title: 'French conversation practice group',
      author: 'Marie Dubois',
      avatar: '/api/placeholder/40/40',
      language: 'French',
      replies: 32,
      time: '6 hours ago',
      isHot: true
    }
  ];

  // Language Practice Groups
  const practiceGroups = [
    {
      language: 'Japanese',
      members: 156,
      level: 'Beginner',
      nextSession: 'Today 7:00 PM',
      progress: 85
    },
    {
      language: 'German',
      members: 89,
      level: 'Intermediate',
      nextSession: 'Tomorrow 6:00 PM',
      progress: 92
    },
    {
      language: 'French',
      members: 124,
      level: 'Advanced',
      nextSession: 'Friday 8:00 PM',
      progress: 78
    },
    {
      language: 'Spanish',
      members: 98,
      level: 'Beginner',
      nextSession: 'Saturday 5:00 PM',
      progress: 88
    },
    {
      language: 'Korean',
      members: 67,
      level: 'Intermediate',
      nextSession: 'Sunday 7:00 PM',
      progress: 95
    },
    {
      language: 'Italian',
      members: 45,
      level: 'Beginner',
      nextSession: 'Monday 6:30 PM',
      progress: 72
    }
  ];

  // Community Guidelines
  const guidelines = [
    {
      icon: '✅',
      title: 'Be respectful to all members',
      description: 'Treat everyone with kindness and respect'
    },
    {
      icon: '💬',
      title: 'Use appropriate language',
      description: 'Keep discussions appropriate and constructive'
    },
    {
      icon: '📚',
      title: 'Share knowledge freely',
      description: 'Help others learn and grow together'
    },
    {
      icon: '🚫',
      title: 'No spam or self-promotion',
      description: 'Keep content relevant to language learning'
    },
    {
      icon: '🌍',
      title: 'Celebrate cultural diversity',
      description: 'Embrace different cultures and perspectives'
    }
  ];

  // Community Champions
  const champions = [
    {
      id: 1,
      name: 'Yuki Tanaka',
      avatar: '/api/placeholder/80/80',
      badge: 'Japanese Master',
      posts: 250,
      helpfulAnswers: 89
    },
    {
      id: 2,
      name: 'Pierre Laurent',
      avatar: '/api/placeholder/80/80',
      badge: 'French Expert',
      posts: 180,
      helpfulAnswers: 76
    },
    {
      id: 3,
      name: 'Hans Weber',
      avatar: '/api/placeholder/80/80',
      badge: 'German Guide',
      posts: 160,
      helpfulAnswers: 68
    },
    {
      id: 4,
      name: 'Maria Garcia',
      avatar: '/api/placeholder/80/80',
      badge: 'Spanish Specialist',
      posts: 140,
      helpfulAnswers: 55
    }
  ];

  const handleJoinForum = (forumId) => {
    // Handle joining language forum
    console.log('Joining forum:', forumId);
  };

  const handleJoinGroup = (group) => {
    // Handle joining practice group
    console.log('Joining group:', group);
  };

  const handleStartDiscussion = () => {
    // Handle starting new discussion
    navigate('/community/new-discussion');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="spinner w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading community...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to NTS Language Community</h1>
          <p className="text-xl mb-8 text-blue-100">
            Connect, Learn, and Practice with Fellow Language Learners
          </p>
          
          {/* Community Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold">{communityStats.members}</div>
              <div className="text-blue-200 text-sm">Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{communityStats.languages}</div>
              <div className="text-blue-200 text-sm">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{communityStats.discussions}</div>
              <div className="text-blue-200 text-sm">Discussions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{communityStats.posts}</div>
              <div className="text-blue-200 text-sm">Posts</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-4 mb-8 border-b">
          {[
            { id: 'discussions', label: 'Active Discussions', icon: '💬' },
            { id: 'forums', label: 'Language Forums', icon: '🗣️' },
            { id: 'groups', label: 'Practice Groups', icon: '👥' },
            { id: 'guidelines', label: 'Guidelines', icon: '📋' },
            { id: 'champions', label: 'Champions', icon: '🏆' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Language Forums Tab */}
        {activeTab === 'forums' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Language Forums</h2>
              <button
                onClick={handleStartDiscussion}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Discussion
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {languageForums.map((forum) => (
                <div key={forum.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{forum.flag}</span>
                      <h3 className="font-semibold text-gray-900">{forum.name}</h3>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{forum.description}</p>
                  
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>{forum.members} members</span>
                    <span>{forum.posts} posts</span>
                  </div>
                  
                  <button
                    onClick={() => handleJoinForum(forum.id)}
                    className="w-full bg-blue-100 text-blue-700 py-2 rounded-md hover:bg-blue-200 transition-colors font-medium"
                  >
                    Join Forum
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Discussions Tab */}
        {activeTab === 'discussions' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Active Discussions</h2>
              <button
                onClick={handleStartDiscussion}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Discussion
              </button>
            </div>
            
            <div className="space-y-4">
              {activeDiscussions.map((discussion) => (
                <div key={discussion.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start gap-4">
                    <img
                      src={discussion.avatar}
                      alt={discussion.author}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{discussion.title}</h3>
                        {discussion.isHot && (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">🔥 Hot</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>by {discussion.author}</span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">{discussion.language}</span>
                        <span>{discussion.replies} replies</span>
                        <span>{discussion.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Practice Groups Tab */}
        {activeTab === 'groups' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Language Practice Groups</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {practiceGroups.map((group, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-gray-900">{group.language}</h3>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">{group.level}</span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Members:</span>
                      <span className="font-medium">{group.members}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Next Session:</span>
                      <span className="font-medium">{group.nextSession}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{group.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${group.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleJoinGroup(group)}
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors font-medium"
                  >
                    Join Group
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Community Guidelines Tab */}
        {activeTab === 'guidelines' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Guidelines</h2>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-green-800 mb-2">Welcome to our community!</h3>
              <p className="text-green-700">
                Please follow these guidelines to ensure a positive experience for everyone.
              </p>
            </div>
            
            <div className="space-y-4">
              {guidelines.map((guideline, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border p-6 flex items-start gap-4">
                  <div className="text-2xl">{guideline.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{guideline.title}</h3>
                    <p className="text-gray-600">{guideline.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Community Champions Tab */}
        {activeTab === 'champions' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Champions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {champions.map((champion) => (
                <div key={champion.id} className="bg-white rounded-lg shadow-sm border p-6 text-center">
                  <img
                    src={champion.avatar}
                    alt={champion.name}
                    className="w-20 h-20 rounded-full mx-auto mb-4"
                  />
                  <h3 className="font-semibold text-gray-900 mb-1">{champion.name}</h3>
                  <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mb-4">
                    🏆 {champion.badge}
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>{champion.posts} posts</div>
                    <div>{champion.helpfulAnswers} helpful answers</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Community;
