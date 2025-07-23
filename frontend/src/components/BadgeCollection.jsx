import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import gamificationService from '../services/gamificationService';

const BadgeCollection = ({ userId = null, showStats = true, limit = null }) => {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);

  const targetUserId = userId || user?.id;

  const categories = [
    { value: 'all', label: 'All Badges', icon: '🏆' },
    { value: 'achievement', label: 'Achievements', icon: '🎯' },
    { value: 'level', label: 'Level', icon: '⭐' },
    { value: 'streak', label: 'Streak', icon: '🔥' },
    { value: 'course', label: 'Course', icon: '📚' },
    { value: 'skill', label: 'Skill', icon: '💪' },
    { value: 'special', label: 'Special', icon: '✨' }
  ];

  useEffect(() => {
    if (targetUserId) {
      fetchBadges();
    }
  }, [targetUserId, selectedCategory]);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      setError(null);

      const category = selectedCategory === 'all' ? null : selectedCategory;
      const response = await gamificationService.getUserBadges(targetUserId, category);
      
      if (response.success) {
        let userBadges = response.data.badges;
        
        // Apply limit if specified
        if (limit) {
          userBadges = userBadges.slice(0, limit);
        }
        
        setBadges(userBadges);
        setStats(response.data.badgeStats);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity) => {
    return gamificationService.getBadgeRarityColor(rarity);
  };

  const getRarityGlow = (rarity) => {
    const glows = {
      common: 'shadow-gray-200',
      uncommon: 'shadow-green-200',
      rare: 'shadow-blue-200',
      epic: 'shadow-purple-200',
      legendary: 'shadow-yellow-200'
    };
    return glows[rarity] || glows.common;
  };

  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
  };

  const closeBadgeModal = () => {
    setSelectedBadge(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-300 rounded-lg"></div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-1">Error Loading Badges</h3>
          <p className="text-gray-600 text-sm mb-3">{error}</p>
          <button
            onClick={fetchBadges}
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
          <h3 className="text-lg font-medium text-gray-900">Badge Collection</h3>
          {showStats && stats && (
            <div className="text-sm text-gray-600">
              {badges.length} badge{badges.length !== 1 ? 's' : ''} earned
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.value
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Badge Grid */}
      <div className="p-6">
        {badges.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-medal text-4xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Badges Yet</h3>
            <p className="text-gray-600">
              {selectedCategory === 'all' 
                ? 'Start learning to earn your first badge!' 
                : `No ${selectedCategory} badges earned yet.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {badges.map((badge, index) => (
              <div
                key={index}
                onClick={() => handleBadgeClick(badge)}
                className={`relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${getRarityColor(badge.rarity)} ${getRarityGlow(badge.rarity)}`}
              >
                {/* Badge Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl">{badge.icon}</span>
                </div>

                {/* Rarity Indicator */}
                <div className="absolute top-1 right-1">
                  <div className={`w-3 h-3 rounded-full ${
                    badge.rarity === 'legendary' ? 'bg-yellow-400' :
                    badge.rarity === 'epic' ? 'bg-purple-400' :
                    badge.rarity === 'rare' ? 'bg-blue-400' :
                    badge.rarity === 'uncommon' ? 'bg-green-400' :
                    'bg-gray-400'
                  }`}></div>
                </div>

                {/* Earned Date */}
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="text-xs text-gray-500 text-center truncate">
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                    <i className="fas fa-eye text-white text-lg"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {showStats && stats && badges.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.common || 0}</div>
                <div className="text-sm text-gray-600">Common</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.uncommon || 0}</div>
                <div className="text-sm text-gray-600">Uncommon</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.rare || 0}</div>
                <div className="text-sm text-gray-600">Rare</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.epic || 0}</div>
                <div className="text-sm text-gray-600">Epic</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.legendary || 0}</div>
                <div className="text-sm text-gray-600">Legendary</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Badge Details</h3>
              <button
                onClick={closeBadgeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center border-4 border-gray-200">
                <span className="text-5xl">{selectedBadge.icon}</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">{selectedBadge.name}</h4>
              <p className="text-gray-600 mb-3">{selectedBadge.description}</p>
              
              <div className="flex items-center justify-center space-x-4 text-sm">
                <span className={`px-2 py-1 rounded-full ${getRarityColor(selectedBadge.rarity)}`}>
                  {selectedBadge.rarity.charAt(0).toUpperCase() + selectedBadge.rarity.slice(1)}
                </span>
                <span className="text-gray-500">
                  {selectedBadge.category.charAt(0).toUpperCase() + selectedBadge.category.slice(1)}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Earned:</span>
                <span className="font-medium">
                  {new Date(selectedBadge.earnedAt).toLocaleDateString()}
                </span>
              </div>
              {selectedBadge.points > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Points Awarded:</span>
                  <span className="font-medium text-blue-600">+{selectedBadge.points}</span>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={closeBadgeModal}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeCollection;
