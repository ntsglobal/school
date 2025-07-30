import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import progressService from '../services/progressService';

const ProgressDashboard = ({ userId = null }) => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('30d');

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchProgressData();
      fetchAnalytics();
    }
  }, [targetUserId, timeframe]);

  const fetchProgressData = async () => {
    try {
      const response = await progressService.getUserProgress(targetUserId);
      if (response.success) {
        setProgressData(response.data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await progressService.getProgressAnalytics(targetUserId, timeframe);
      if (response.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getStreakEmoji = (days) => {
    if (days >= 30) return '🔥';
    if (days >= 14) return '⚡';
    if (days >= 7) return '✨';
    if (days >= 3) return '💪';
    return '📚';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    if (percentage >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <i className="fas fa-exclamation-triangle text-4xl"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Progress</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <i className="fas fa-chart-line text-4xl"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Progress Data</h3>
        <p className="text-gray-600">Start learning to see your progress here!</p>
      </div>
    );
  }

  const { overallStats, progressByCourse, recentActivity, streakData } = progressData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Learning Progress</h2>
        <div className="flex items-center space-x-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-book text-blue-600"></i>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Lessons Completed</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.completedLessons}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-clock text-green-600"></i>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Study Time</p>
              <p className="text-2xl font-bold text-gray-900">{formatTime(overallStats.totalTimeSpent)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-star text-yellow-600"></i>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(overallStats.averageScore)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">{getStreakEmoji(streakData.currentStreak)}</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900">{streakData.currentStreak} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Progress */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Course Progress</h3>
        </div>
        <div className="p-6">
          {progressByCourse.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No courses enrolled yet</p>
              <Link
                to="/courses"
                className="mt-2 inline-block text-blue-600 hover:text-blue-700"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {progressByCourse.map((course) => (
                <div key={course._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{course.courseName}</h4>
                      <p className="text-sm text-gray-600">
                        {course.courseLanguage} • {course.courseLevel}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {Math.round(course.completionPercentage)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {course.completedLessons}/{course.totalLessons} lessons
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(course.completionPercentage)}`}
                      style={{ width: `${course.completionPercentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Avg Score: {Math.round(course.averageScore)}%</span>
                    <span>Time: {formatTime(course.totalTimeSpent)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-play text-blue-600 text-xs"></i>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.lessonId?.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.courseId?.title} • {activity.courseId?.language}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-xs text-gray-500">
                    {new Date(activity.lastAccessedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Performance Analytics</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(analytics.completion.completionRate)}%
                </p>
                <p className="text-sm text-gray-600">Completion Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {formatTime(analytics.studyTime.average)}
                </p>
                <p className="text-sm text-gray-600">Avg Session Time</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {streakData.longestStreak}
                </p>
                <p className="text-sm text-gray-600">Longest Streak</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;
