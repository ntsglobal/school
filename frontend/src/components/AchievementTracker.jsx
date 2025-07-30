import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import gamificationService from '../services/gamificationService';

const AchievementTracker = ({ userId = null, showCompleted = true, limit = null }) => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const targetUserId = userId || user?.id;

  const filterOptions = [
    { value: 'all', label: 'All', icon: '📋' },
    { value: 'completed', label: 'Completed', icon: '✅' },
    { value: 'incomplete', label: 'In Progress', icon: '⏳' }
  ];

  useEffect(() => {
    if (targetUserId) {
      fetchAchievements();
    }
  }, [targetUserId, filter]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await gamificationService.getAchievements(targetUserId, filter);
      
      if (response.success) {
        let userAchievements = response.data.achievements;
        
        // Filter out completed if not showing them
        if (!showCompleted) {
          userAchievements = userAchievements.filter(a => !a.isCompleted);
        }
        
        // Apply limit if specified
        if (limit) {
          userAchievements = userAchievements.slice(0, limit);
        }
        
        setAchievements(userAchievements);
        setStats(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage) => {
    return gamificationService.getProgressColor(percentage);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      points: '💰',
      streak: '🔥',
      course: '📚',
      lesson: '📖',
      time: '⏰',
      social: '👥',
      skill: '💪',
      special: '✨'
    };
    return icons[category] || '🎯';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-2 bg-gray-300 rounded"></div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-1">Error Loading Achievements</h3>
          <p className="text-gray-600 text-sm mb-3">{error}</p>
          <button
            onClick={fetchAchievements}
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Achievements</h3>
          {stats && (
            <div className="text-sm text-gray-600">
              {stats.completed}/{stats.total} completed
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === option.value
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Achievement List */}
      <div className="p-6">
        {achievements.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-trophy text-4xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'completed' ? 'No Completed Achievements' : 'No Achievements Yet'}
            </h3>
            <p className="text-gray-600">
              {filter === 'completed' 
                ? 'Keep learning to unlock achievements!' 
                : 'Start your learning journey to see achievements here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  achievement.isCompleted
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Achievement Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    achievement.isCompleted
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {achievement.isCompleted ? (
                      <i className="fas fa-check text-xl"></i>
                    ) : (
                      <span className="text-xl">{getCategoryIcon(achievement.category)}</span>
                    )}
                  </div>

                  {/* Achievement Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-medium ${
                        achievement.isCompleted ? 'text-green-900' : 'text-gray-900'
                      }`}>
                        {achievement.name}
                      </h4>
                      {achievement.pointsReward > 0 && (
                        <div className="flex items-center space-x-1 text-sm text-blue-600">
                          <i className="fas fa-coins"></i>
                          <span>+{achievement.pointsReward}</span>
                        </div>
                      )}
                    </div>

                    <p className={`text-sm mb-3 ${
                      achievement.isCompleted ? 'text-green-700' : 'text-gray-600'
                    }`}>
                      {achievement.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={achievement.isCompleted ? 'text-green-600' : 'text-gray-600'}>
                          Progress: {achievement.progress}/{achievement.target}
                        </span>
                        <span className={`font-medium ${
                          achievement.isCompleted ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {achievement.progressPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            achievement.isCompleted ? 'bg-green-500' : getProgressColor(achievement.progressPercentage)
                          }`}
                          style={{ width: `${Math.min(100, achievement.progressPercentage)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Achievement Meta */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full ${
                          achievement.isCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                        </span>
                        {achievement.isCompleted && achievement.completedAt && (
                          <span className="text-green-600">
                            Completed {new Date(achievement.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      {!achievement.isCompleted && achievement.progressPercentage > 0 && (
                        <span className="text-blue-600">
                          {achievement.target - achievement.progress} more to go!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {stats && achievements.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{stats.notStarted}</div>
                <div className="text-sm text-gray-600">Not Started</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementTracker;
