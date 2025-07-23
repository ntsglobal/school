import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import gamificationService from '../services/gamificationService';

const PointsDisplay = ({ userId = null, showDetails = false, size = 'normal' }) => {
  const { user } = useAuth();
  const [gamificationData, setGamificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const targetUserId = userId || user?.id;

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
        setGamificationData(response.data.gamification);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'p-3',
          points: 'text-lg',
          level: 'text-sm',
          progress: 'h-1.5'
        };
      case 'large':
        return {
          container: 'p-6',
          points: 'text-3xl',
          level: 'text-lg',
          progress: 'h-3'
        };
      default:
        return {
          container: 'p-4',
          points: 'text-xl',
          level: 'text-base',
          progress: 'h-2'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border ${sizeClasses.container} animate-pulse`}>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !gamificationData) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border ${sizeClasses.container}`}>
        <div className="text-center text-gray-500">
          <i className="fas fa-exclamation-triangle mb-2"></i>
          <p className="text-sm">Unable to load points</p>
        </div>
      </div>
    );
  }

  const levelProgress = Math.round((gamificationData.experience / gamificationData.experienceToNextLevel) * 100);

  return (
    <div className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg ${sizeClasses.container}`}>
      <div className="flex items-center space-x-4">
        {/* Level Badge */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className={`font-bold ${sizeClasses.level} text-white`}>
              {gamificationData.level}
            </span>
          </div>
        </div>

        {/* Points and Level Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <i className="fas fa-coins text-yellow-300"></i>
            <span className={`font-bold ${sizeClasses.points}`}>
              {gamificationService.formatPoints(gamificationData.totalPoints)}
            </span>
            <span className="text-blue-100 text-sm">points</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-blue-100 text-sm">
              Level {gamificationData.level}
            </span>
            <span className="text-blue-200 text-xs">
              • {gamificationService.getLevelTitle(gamificationData.level)}
            </span>
          </div>

          {/* Experience Progress Bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-blue-100 mb-1">
              <span>{gamificationData.experience} XP</span>
              <span>{gamificationData.experienceToNextLevel} XP</span>
            </div>
            <div className={`w-full bg-white bg-opacity-20 rounded-full ${sizeClasses.progress}`}>
              <div
                className={`bg-yellow-300 ${sizeClasses.progress} rounded-full transition-all duration-500`}
                style={{ width: `${levelProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Available Points (if different from total) */}
        {gamificationData.availablePoints !== gamificationData.totalPoints && (
          <div className="flex-shrink-0 text-right">
            <div className="text-xs text-blue-100">Available</div>
            <div className="font-semibold">
              {gamificationService.formatPoints(gamificationData.availablePoints)}
            </div>
          </div>
        )}
      </div>

      {/* Detailed Stats (if enabled) */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-white border-opacity-20">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-blue-100">Weekly Points</div>
              <div className="font-semibold">
                {gamificationService.formatPoints(gamificationData.weeklyPoints || 0)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-blue-100">Monthly Points</div>
              <div className="font-semibold">
                {gamificationService.formatPoints(gamificationData.monthlyPoints || 0)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-blue-100">Current Streak</div>
              <div className="font-semibold flex items-center justify-center space-x-1">
                <span>{gamificationService.getStreakEmoji(gamificationData.currentStreak)}</span>
                <span>{gamificationData.currentStreak}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-blue-100">Badges</div>
              <div className="font-semibold">
                {gamificationData.badges?.length || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Motivational Message */}
      {showDetails && (
        <div className="mt-3 text-center">
          <p className="text-blue-100 text-sm italic">
            {gamificationService.getMotivationalMessage(gamificationData)}
          </p>
        </div>
      )}
    </div>
  );
};

// Compact version for headers/navbars
export const CompactPointsDisplay = ({ userId = null }) => {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchPoints();
    }
  }, [targetUserId]);

  const fetchPoints = async () => {
    try {
      const response = await gamificationService.getUserGamification(targetUserId);
      if (response.success) {
        setPoints(response.data.gamification.totalPoints);
        setLevel(response.data.gamification.level);
      }
    } catch (err) {
      console.error('Failed to fetch points:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 animate-pulse">
        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
        <div className="w-16 h-4 bg-gray-300 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full">
      <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
        <span className="text-xs font-bold">{level}</span>
      </div>
      <div className="flex items-center space-x-1">
        <i className="fas fa-coins text-yellow-300 text-xs"></i>
        <span className="font-semibold text-sm">
          {gamificationService.formatPoints(points)}
        </span>
      </div>
    </div>
  );
};

// Points animation component for when points are earned
export const PointsAnimation = ({ points, onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
        <div className="flex items-center space-x-2">
          <i className="fas fa-plus text-xl"></i>
          <span className="text-xl font-bold">+{points}</span>
          <i className="fas fa-coins text-yellow-300"></i>
        </div>
        <div className="text-center text-sm mt-1">Points Earned!</div>
      </div>
    </div>
  );
};

export default PointsDisplay;
