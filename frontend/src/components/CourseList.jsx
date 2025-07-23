import React, { useState, useEffect } from 'react';
import CourseCard from './CourseCard';
import courseService from '../services/courseService';

const CourseList = ({ 
  title = "Courses", 
  filters = {}, 
  showFilters = true, 
  showEnrollButton = true,
  showProgress = false,
  limit = null 
}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFilters, setCurrentFilters] = useState(filters);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: limit || 12,
    total: 0,
    pages: 0
  });

  // Filter options
  const filterOptions = {
    languages: [
      { value: 'french', label: 'French 🇫🇷' },
      { value: 'japanese', label: 'Japanese 🇯🇵' },
      { value: 'german', label: 'German 🇩🇪' },
      { value: 'spanish', label: 'Spanish 🇪🇸' },
      { value: 'korean', label: 'Korean 🇰🇷' }
    ],
    levels: [
      { value: 'A1', label: 'A1 - Beginner' },
      { value: 'A2', label: 'A2 - Elementary' },
      { value: 'B1', label: 'B1 - Intermediate' }
    ],
    grades: [
      { value: '6', label: 'Grade 6' },
      { value: '7', label: 'Grade 7' },
      { value: '8', label: 'Grade 8' },
      { value: '9', label: 'Grade 9' },
      { value: '10', label: 'Grade 10' }
    ],
    difficulties: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' }
    ]
  };

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...currentFilters,
        page: pagination.page,
        limit: pagination.limit
      };

      const response = await courseService.getAllCourses(params);
      
      if (response.success) {
        setCourses(response.data.courses);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch courses when filters or pagination change
  useEffect(() => {
    fetchCourses();
  }, [currentFilters, pagination.page]);

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setCurrentFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle search
  const handleSearch = (searchTerm) => {
    setCurrentFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Clear filters
  const clearFilters = () => {
    setCurrentFilters({});
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && courses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                <div className="h-8 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Courses</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchCourses}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600 mt-1">
            {pagination.total} course{pagination.total !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentFilters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Language Filter */}
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentFilters.language || ''}
                onChange={(e) => handleFilterChange('language', e.target.value)}
              >
                <option value="">All Languages</option>
                {filterOptions.languages.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentFilters.level || ''}
                onChange={(e) => handleFilterChange('level', e.target.value)}
              >
                <option value="">All Levels</option>
                {filterOptions.levels.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade Filter */}
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentFilters.grade || ''}
                onChange={(e) => handleFilterChange('grade', e.target.value)}
              >
                <option value="">All Grades</option>
                {filterOptions.grades.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div>
              <button
                onClick={clearFilters}
                className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <i className="fas fa-search text-4xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Found</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map(course => (
            <CourseCard
              key={course._id}
              course={course}
              showEnrollButton={showEnrollButton}
              showProgress={showProgress}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <i className="fas fa-chevron-left"></i>
          </button>

          {[...Array(pagination.pages)].map((_, index) => {
            const page = index + 1;
            const isCurrentPage = page === pagination.page;
            
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 rounded-md ${
                  isCurrentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Loading overlay for pagination */}
      {loading && courses.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading courses...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseList;
