import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CourseCard = ({ course, showEnrollButton = true, showProgress = false }) => {
  const { user } = useAuth();

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getLevelColor = (level) => {
    const colors = {
      A1: 'bg-blue-100 text-blue-800',
      A2: 'bg-indigo-100 text-indigo-800',
      B1: 'bg-purple-100 text-purple-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getLanguageFlag = (language) => {
    const flags = {
      french: '🇫🇷',
      japanese: '🇯🇵',
      german: '🇩🇪',
      spanish: '🇪🇸',
      korean: '🇰🇷'
    };
    return flags[language] || '🌍';
  };

  const formatPrice = (price, currency) => {
    if (price === 0) return 'Free';
    return `${currency} ${price}`;
  };

  const formatDuration = (hours) => {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    return `${hours}h`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Course Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-6xl">{getLanguageFlag(course.language)}</span>
          </div>
        )}
        
        {/* Language and Level Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
            {course.level}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
            {course.difficulty}
          </span>
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-white bg-opacity-90 px-2 py-1 rounded-full text-xs font-medium text-gray-800">
            {formatPrice(course.price, course.currency)}
          </span>
        </div>

        {/* Progress Bar (if showing progress) */}
        {showProgress && course.userProgress && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
            <div className="flex items-center justify-between text-white text-xs mb-1">
              <span>Progress</span>
              <span>{Math.round(course.userProgress.completionPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${course.userProgress.completionPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-4">
        {/* Title and Description */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {course.shortDescription || course.description}
          </p>
        </div>

        {/* Course Meta Information */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <i className="fas fa-clock"></i>
              {formatDuration(course.estimatedDuration)}
            </span>
            <span className="flex items-center gap-1">
              <i className="fas fa-book"></i>
              {course.totalLessons} lessons
            </span>
            <span className="flex items-center gap-1">
              <i className="fas fa-graduation-cap"></i>
              Grade {course.grade}
            </span>
          </div>
        </div>

        {/* Instructor */}
        <div className="flex items-center mb-3">
          <img
            src={course.instructor?.avatar || '/default-avatar.png'}
            alt={course.instructor?.firstName}
            className="w-6 h-6 rounded-full mr-2"
          />
          <span className="text-sm text-gray-600">
            {course.instructor?.firstName} {course.instructor?.lastName}
          </span>
        </div>

        {/* Rating and Enrollment */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className={`fas fa-star ${
                    i < Math.floor(course.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                ></i>
              ))}
            </div>
            <span className="ml-1">
              {course.averageRating ? course.averageRating.toFixed(1) : 'No ratings'}
            </span>
          </div>
          <span>{course.enrollmentCount || 0} students</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            to={`/courses/${course._id}`}
            className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
          >
            View Details
          </Link>
          
          {showEnrollButton && user && !course.isEnrolled && (
            <button
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
              onClick={() => {
                // Handle enrollment - this would be connected to the enrollment service
                console.log('Enroll in course:', course._id);
              }}
            >
              Enroll Now
            </button>
          )}

          {course.isEnrolled && (
            <Link
              to={`/courses/${course._id}/learn`}
              className="flex-1 bg-purple-600 text-white text-center py-2 px-4 rounded-md hover:bg-purple-700 transition-colors duration-200 text-sm font-medium"
            >
              Continue Learning
            </Link>
          )}
        </div>

        {/* Skills/Tags */}
        {course.skills && course.skills.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex flex-wrap gap-1">
              {course.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
              {course.skills.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{course.skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
