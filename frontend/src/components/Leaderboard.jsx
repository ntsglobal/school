import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import gamificationService from '../services/gamificationService';

const Leaderboard = ({ type = 'total', limit = 10, showUserRank = true }) => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState(type);

  const leaderboardTypes = [
    { value: 'total', label: 'All Time', icon: '🏆' },
    { value: 'weekly', label: 'This Week', icon: '📅' },
    { value: 'monthly', label: 'This Month', icon: '📊' },
    { value: 'level', label: 'By Level', icon: '⭐' },
    { value: 'streak', label: 'Streak', icon: '🔥' }
  ];

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedType]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await gamificationService.getLeaderboard(selectedType, limit);
      
      if (response.success) {
        setLeaderboard(response.data.leaderboard);
        
        // Get user's rank if authenticated
        if (user && showUserRank) {
          // Find user in leaderboard or get their rank
          const userInLeaderboard = response.data.leaderboard.find(
            entry => entry.user.id === user.id
          );
          
          if (userInLeaderboard) {
            setUserRank(userInLeaderboard.rank);
          } else {
            // User not in top list, get their actual rank
            // This would require an additional API call
            setUserRank(null);
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-50';
      case 2: return 'text-gray-600 bg-gray-50';
      case 3: return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-700 bg-white';
    }
  };

  const getValueByType = (entry) => {
    switch (selectedType) {
      case 'weekly':
        return gamificationService.formatPoints(entry.weeklyPoints || 0);
      case 'monthly':
        return gamificationService.formatPoints(entry.monthlyPoints || 0);
      case 'level':
        return `Level ${entry.level}`;
      case 'streak':
        return `${entry.currentStreak} days`;
      default:
        return gamificationService.formatPoints(entry.totalPoints);
    }
  };

  const getTypeLabel = () => {
    const typeObj = leaderboardTypes.find(t => t.value === selectedType);
    return typeObj ? typeObj.label : 'Leaderboard';
  };

  const getTypeIcon = () => {
    const typeObj = leaderboardTypes.find(t => t.value === selectedType);
    return typeObj ? typeObj.icon : '🏆';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <div className="text-red-600 mb-2">
            <i className="fas fa-exclamation-triangle text-2xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Error Loading Leaderboard</h3>
          <p className="text-gray-600 text-sm mb-3">{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getTypeIcon()}</span>
            <h3 className="text-lg font-medium text-gray-900">{getTypeLabel()}</h3>
          </div>
          
          {/* Type Selector */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {leaderboardTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="p-6">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <i className="fas fa-trophy text-3xl"></i>
            </div>
            <p className="text-gray-500">No data available yet</p>
            <p className="text-gray-400 text-sm">Start learning to see the leaderboard!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.user.id}
                className={`flex items-center space-x-4 p-3 rounded-lg border transition-colors ${
                  entry.user.id === user?.id 
                    ? 'bg-blue-50 border-blue-200' 
                    : getRankColor(entry.rank)
                }`}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-8 text-center">
                  <span className="font-bold text-lg">
                    {getRankIcon(entry.rank)}
                  </span>
                </div>

                {/* Avatar */}
                <div className="flex-shrink-0">
                  <img
                    src={entry.user.avatar || '/default-avatar.png'}
                    alt={entry.user.firstName}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                  />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 truncate">
                      {entry.user.firstName} {entry.user.lastName}
                    </p>
                    {entry.user.id === user?.id && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span>Level {entry.level}</span>
                    {entry.user.grade && (
                      <span>Grade {entry.user.grade}</span>
                    )}
                    {entry.currentStreak > 0 && (
                      <span className="flex items-center space-x-1">
                        <span>🔥</span>
                        <span>{entry.currentStreak}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="flex-shrink-0 text-right">
                  <p className="font-bold text-gray-900">
                    {getValueByType(entry)}
                  </p>
                  {selectedType === 'total' && (
                    <p className="text-xs text-gray-500">
                      {gamificationService.formatPoints(entry.experience)} XP
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* User Rank (if not in top list) */}
        {user && showUserRank && userRank && userRank > limit && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.avatar || '/default-avatar.png'}
                    alt={user.firstName}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Your Rank</p>
                    <p className="text-xs text-gray-500">
                      {gamificationService.formatRank(userRank)} place
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">#{userRank}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-4 text-center">
          <button
            onClick={fetchLeaderboard}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <i className="fas fa-sync-alt mr-1"></i>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
