import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PointsDisplay from './PointsDisplay';
import BadgeCollection from './BadgeCollection';
import Leaderboard from './Leaderboard';
import AchievementTracker from './AchievementTracker';
import gamificationService from '../services/gamificationService';

const GamificationDashboard = ({ userId = null }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [gamificationData, setGamificationData] = useState(null);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'badges', label: 'Badges', icon: '🎖️' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🥇' }
  ];

  useEffect(() => {
    if (targetUserId) {
      fetchGamificationData();
    }
  }, [targetUserId]);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      const response = await gamificationService.getUserGamification(targetUserId);
      
      if (response.success) {
        setGamificationData(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch gamification data:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Points and Level Display */}
      <PointsDisplay userId={targetUserId} showDetails={true} size="large" />

      {/* Quick Stats Grid */}
      {gamificationData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-fire text-blue-600 text-xl"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {gamificationData.gamification.currentStreak}
            </div>
            <div className="text-sm text-gray-600">Day Streak</div>
            <div className="text-xs text-gray-500 mt-1">
              Longest: {gamificationData.gamification.longestStreak} days
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-medal text-green-600 text-xl"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {gamificationData.gamification.badges?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Badges Earned</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-trophy text-purple-600 text-xl"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {gamificationData.stats.achievementCount}
            </div>
            <div className="text-sm text-gray-600">Achievements</div>
            <div className="text-xs text-gray-500 mt-1">
              of {gamificationData.stats.totalAchievements}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-star text-yellow-600 text-xl"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {gamificationData.gamification.level}
            </div>
            <div className="text-sm text-gray-600">Current Level</div>
            <div className="text-xs text-gray-500 mt-1">
              {gamificationData.stats.nextLevelProgress}% to next
            </div>
          </div>
        </div>
      )}

      {/* Recent Achievements Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AchievementTracker userId={targetUserId} limit={3} />
        <BadgeCollection userId={targetUserId} limit={6} />
      </div>

      {/* Mini Leaderboard */}
      <Leaderboard type="total" limit={5} showUserRank={true} />
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-3"></div>
                <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {targetUserId === user?.id ? 'Your Progress' : 'Student Progress'}
        </h1>
        
        {/* Motivational Message */}
        {gamificationData && (
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {gamificationService.getMotivationalMessage(gamificationData.gamification)}
            </p>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && renderOverview()}
        
        {activeTab === 'achievements' && (
          <AchievementTracker userId={targetUserId} showCompleted={true} />
        )}
        
        {activeTab === 'badges' && (
          <BadgeCollection userId={targetUserId} showStats={true} />
        )}
        
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <Leaderboard type="total" limit={20} showUserRank={true} />
          </div>
        )}
      </div>

      {/* Quick Actions (for teachers/admins) */}
      {(user?.role === 'teacher' || user?.role === 'admin') && targetUserId !== user?.id && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
              <i className="fas fa-plus mr-2"></i>
              Award Points
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm">
              <i className="fas fa-medal mr-2"></i>
              Award Badge
            </button>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm">
              <i className="fas fa-trophy mr-2"></i>
              Create Achievement
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm">
              <i className="fas fa-download mr-2"></i>
              Export Progress
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationDashboard;
