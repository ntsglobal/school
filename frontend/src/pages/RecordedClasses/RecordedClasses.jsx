import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import courseService from '../../services/courseService';
import lessonService from '../../services/lessonService';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './RecordedClasses.css';

const RecordedClasses = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [allLessons, setAllLessons] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCoursesAndLessons();
    fetchUserProgress();
  }, []);

  useEffect(() => {
    filterLessons();
  }, [selectedLanguage, selectedLevel, sortBy, searchTerm, allLessons]);

  const fetchCoursesAndLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch recorded lessons directly first
      try {
        const recordedLessonsResponse = await lessonService.getRecordedLessons();
        const recordedLessons = recordedLessonsResponse.data.lessons || [];
        setAllLessons(recordedLessons);
        setLoading(false);
        return;
      } catch (recordedError) {
        console.log('Direct recorded lessons fetch failed, falling back to course-based fetch');
      }

      // Fallback: Fetch all courses and their lessons
      const coursesResponse = await courseService.getAllCourses();
      const coursesData = coursesResponse.data.courses || [];
      setCourses(coursesData);

      // Fetch lessons for all courses
      const lessonsPromises = coursesData.map(course => 
        lessonService.getLessonsByCourse(course._id)
      );
      
      const lessonsResponses = await Promise.all(lessonsPromises);
      const allLessonsData = lessonsResponses.flatMap((response, index) => 
        (response.data.lessons || []).map(lesson => ({
          ...lesson,
          course: coursesData[index]
        }))
      );

      // Filter only video lessons for recorded classes
      const videoLessons = allLessonsData.filter(lesson => 
        lesson.type === 'video' && lesson.content?.videoUrl
      );

      setAllLessons(videoLessons);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses and lessons:', error);
      setError('Failed to load recorded classes. Please try again later.');
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const progressResponse = await lessonService.getUserLessonProgress();
      const progressData = progressResponse.data.progress || {};
      
      // Convert progress array to map for easier lookup
      const progressMap = {};
      if (Array.isArray(progressData)) {
        progressData.forEach(item => {
          progressMap[item.lessonId] = item;
        });
      } else {
        Object.assign(progressMap, progressData);
      }
      
      setUserProgress(progressMap);
    } catch (error) {
      console.error('Error fetching user progress:', error);
      // Don't show error for progress fetch failure
    }
  };

  const filterLessons = () => {
    let filtered = [...allLessons];

    // Filter by language
    if (selectedLanguage !== 'All') {
      filtered = filtered.filter(lesson => 
        lesson.course.language?.toLowerCase() === selectedLanguage.toLowerCase()
      );
    }

    // Filter by level
    if (selectedLevel !== 'All') {
      filtered = filtered.filter(lesson => 
        lesson.course.level === selectedLevel
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(lesson =>
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort lessons
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    setFilteredLessons(filtered);
  };

  const handleLessonClick = (lesson) => {
    navigate(`/lessons/${lesson._id}`);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getProgressPercentage = (lesson) => {
    const progress = userProgress[lesson._id];
    if (!progress) return 0;
    
    if (progress.completed) return 100;
    if (progress.watchTime && lesson.duration) {
      return Math.min(Math.round((progress.watchTime / lesson.duration) * 100), 99);
    }
    return progress.progressPercentage || 0;
  };

  const getLanguageIcon = (language) => {
    const icons = {
      japanese: '🇯🇵',
      french: '🇫🇷',
      german: '🇩🇪',
      spanish: '🇪🇸',
      korean: '🇰🇷'
    };
    return icons[language?.toLowerCase()] || '🌐';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="spinner w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading recorded classes...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-white p-8 rounded-lg shadow-sm max-w-md">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Classes</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchCoursesAndLessons();
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Self-Paced Language Lessons</h1>
          <p className="text-gray-600">
            Explore our comprehensive library of recorded language lessons for independent study
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              {/* Language Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Languages</option>
                  <option value="Japanese">Japanese</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Korean">Korean</option>
                </select>
              </div>

              {/* Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Levels</option>
                  <option value="A1">Beginner (A1)</option>
                  <option value="A2">Elementary (A2)</option>
                  <option value="B1">Intermediate (B1)</option>
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search lessons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Continue Learning Section */}
        {filteredLessons.some(lesson => getProgressPercentage(lesson) > 0 && getProgressPercentage(lesson) < 100) && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Continue Learning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons
                .filter(lesson => {
                  const progress = getProgressPercentage(lesson);
                  return progress > 0 && progress < 100;
                })
                .slice(0, 3)
                .map((lesson) => (
                <LessonCard
                  key={lesson._id}
                  lesson={lesson}
                  progress={getProgressPercentage(lesson)}
                  onLessonClick={handleLessonClick}
                  formatDuration={formatDuration}
                  getLanguageIcon={getLanguageIcon}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Lessons Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">All Lessons</h2>
          
          {filteredLessons.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <div className="text-gray-400 text-5xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons.map((lesson) => (
                <LessonCard
                  key={lesson._id}
                  lesson={lesson}
                  progress={getProgressPercentage(lesson)}
                  onLessonClick={handleLessonClick}
                  formatDuration={formatDuration}
                  getLanguageIcon={getLanguageIcon}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Lesson Card Component
const LessonCard = ({ lesson, progress, onLessonClick, formatDuration, getLanguageIcon }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      onClick={() => onLessonClick(lesson)}
    >
      {/* Video Thumbnail */}
      <div className="relative">
        <img
          src={lesson.content?.videoThumbnail || '/api/placeholder/400/200'}
          alt={lesson.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-20 transition-all">
          <div className="bg-white bg-opacity-90 rounded-full p-3">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 5v10l8-5-8-5z"/>
            </svg>
          </div>
        </div>
        
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {formatDuration(lesson.duration)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{lesson.title}</h3>
          <span className="text-lg ml-2 flex-shrink-0">
            {getLanguageIcon(lesson.course?.language)}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lesson.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span>{lesson.course?.level}</span>
          <span>{lesson.course?.title}</span>
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="flex justify-between items-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            progress === 100 
              ? 'bg-green-100 text-green-800' 
              : progress > 0 
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
          }`}>
            {progress === 100 ? '✓ Complete' : progress > 0 ? 'In Progress' : 'Start Learning'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecordedClasses;
