import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaUserPlus, 
  FaComments, 
  FaCog, 
  FaGlobe,
  FaFilter,
  FaBell
} from 'react-icons/fa';
import LanguageBuddyFinder from '../components/LanguageBuddyFinder';
import BuddyProfileSetup from '../components/BuddyProfileSetup';
import BuddyConnections from '../components/BuddyConnections';
import BuddyNotifications from '../components/BuddyNotifications';
import buddyService from '../services/buddyService.js';

const LanguageBuddyPage = () => {
  const [currentTab, setCurrentTab] = useState('find'); // find, connections, setup
  const [buddyProfile, setBuddyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadBuddyProfile();
  }, []);

  const loadBuddyProfile = async () => {
    try {
      const response = await buddyService.getBuddyProfile();
      setBuddyProfile(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading buddy profile:', error);
      // If no profile exists, user needs to set one up
      setBuddyProfile(null);
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.type === 'buddy_request') {
      setCurrentTab('connections');
    } else if (notification.type === 'view_all') {
      // Could navigate to a dedicated notifications page
      setCurrentTab('connections');
    }
  };

  const handleProfileCreated = () => {
    loadBuddyProfile();
    setCurrentTab('find');
  };

  // Show setup page if no buddy profile exists
  if (!loading && !buddyProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Welcome to Language Buddy Finder!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect with language learning partners from around the world and practice together.
            </p>
          </div>
          <BuddyProfileSetup onProfileCreated={handleProfileCreated} />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your buddy profile...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { 
      id: 'find', 
      label: 'Find Buddies', 
      icon: FaUsers, 
      description: 'Discover new language learning partners'
    },
    { 
      id: 'connections', 
      label: 'My Connections', 
      icon: FaComments, 
      description: 'Manage your buddy relationships'
    },
    { 
      id: 'setup', 
      label: 'Profile Setup', 
      icon: FaCog, 
      description: 'Update your buddy preferences'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-green-600 text-white p-3 rounded-lg">
                <FaGlobe className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Language Buddy Finder</h1>
                <p className="text-gray-600">Connect • Practice • Learn Together</p>
              </div>
            </div>
            
            {/* Notifications */}
            <div className="flex items-center space-x-4">
              <BuddyNotifications onNotificationClick={handleNotificationClick} />
              
              {/* Profile Summary */}
              {buddyProfile && (
                <div className="hidden md:flex items-center space-x-3 bg-gray-50 rounded-lg px-4 py-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">
                      {buddyProfile.user?.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {buddyProfile.user?.firstName} {buddyProfile.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-600">
                      Learning {buddyProfile.targetLanguages?.join(', ') || 'Languages'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`group py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    currentTab === tab.id
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className={`text-lg transition-colors duration-200 ${
                      currentTab === tab.id 
                        ? 'text-green-600' 
                        : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Description */}
        <div className="mb-6">
          <p className="text-gray-600">
            {tabs.find(tab => tab.id === currentTab)?.description}
          </p>
        </div>

        {/* Content */}
        {currentTab === 'find' && (
          <div>
            <LanguageBuddyFinder buddyProfile={buddyProfile} />
          </div>
        )}

        {currentTab === 'connections' && (
          <div>
            <BuddyConnections />
          </div>
        )}

        {currentTab === 'setup' && (
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Update Your Buddy Profile
              </h2>
              <p className="text-gray-600 mb-6">
                Modify your language learning preferences, interests, and goals to find better matches.
              </p>
            </div>
            <BuddyProfileSetup 
              existingProfile={buddyProfile}
              onProfileCreated={handleProfileCreated} 
              isEdit={true}
            />
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">500+</div>
              <div className="text-sm text-gray-600">Active Language Learners</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">50+</div>
              <div className="text-sm text-gray-600">Languages Supported</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">1000+</div>
              <div className="text-sm text-gray-600">Successful Connections</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">24/7</div>
              <div className="text-sm text-gray-600">Global Community</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageBuddyPage;
