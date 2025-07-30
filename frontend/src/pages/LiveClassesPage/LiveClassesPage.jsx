import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import liveClassService from '../../services/liveClassService';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const LiveClassesPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [liveClasses, setLiveClasses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    loadLiveClasses();
  }, []);

  const loadLiveClasses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user's live classes and upcoming classes
      const [userClassesResponse, upcomingResponse] = await Promise.all([
        liveClassService.getUserLiveClasses(),
        liveClassService.getUpcomingClasses()
      ]);

      // Backend returns { success: true, data: { liveClasses: [...] } }
      // Service layer returns response.data, so we get { liveClasses: [...] }
      setLiveClasses(userClassesResponse?.data?.liveClasses || userClassesResponse?.liveClasses || []);
      setUpcomingClasses(upcomingResponse?.data?.liveClasses || upcomingResponse?.liveClasses || []);
    } catch (err) {
      console.error('Error loading live classes:', err);
      setError('Failed to load live classes');
    } finally {
      setLoading(false);
    }
  };

  const joinVideoCall = async (classId) => {
    try {
      // Navigate to video room
      navigate(`/live-classes/${classId}/video`);
    } catch (err) {
      console.error('Error joining video call:', err);
      alert('Failed to join video call');
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getClassStatus = (scheduledAt, duration) => {
    // Handle both field names for compatibility
    const scheduleTime = scheduledAt || liveClass?.scheduledDate;
    const now = new Date();
    const startTime = new Date(scheduleTime);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    if (now < startTime) {
      return { status: 'upcoming', color: 'text-blue-600', bg: 'bg-blue-100' };
    } else if (now >= startTime && now <= endTime) {
      return { status: 'live', color: 'text-green-600', bg: 'bg-green-100' };
    } else {
      return { status: 'ended', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const renderClassCard = (liveClass) => {
    const statusInfo = getClassStatus(liveClass.scheduledAt || liveClass.scheduledDate, liveClass.duration);
    const isLive = statusInfo.status === 'live';

    return (
      <div key={liveClass._id} className="bg-white rounded-lg shadow-md p-6 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {liveClass.title}
            </h3>
            <p className="text-gray-600 mb-2">{liveClass.description}</p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
              <span className="flex items-center">
                <i className="fas fa-language mr-1"></i>
                {liveClass.language?.charAt(0).toUpperCase() + liveClass.language?.slice(1)}
              </span>
              <span className="flex items-center">
                <i className="fas fa-chart-line mr-1"></i>
                Level {liveClass.level}
              </span>
              <span className="flex items-center">
                <i className="fas fa-clock mr-1"></i>
                {liveClass.duration} minutes
              </span>
              <span className="flex items-center">
                <i className="fas fa-users mr-1"></i>
                {liveClass.participants?.length || 0}/{liveClass.maxParticipants}
              </span>
            </div>

            <div className="flex items-center space-x-4 mb-3">
              <span className="text-gray-700">
                <i className="fas fa-calendar-alt mr-1"></i>
                {formatDateTime(liveClass.scheduledAt || liveClass.scheduledDate)}
              </span>
            </div>

            {liveClass.instructor && (
              <div className="flex items-center mb-3">
                <img
                  src={liveClass.instructor.avatar || '/images/users/default-avatar.png'}
                  alt={`${liveClass.instructor.firstName} ${liveClass.instructor.lastName}`}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span className="text-gray-700">
                  {liveClass.instructor.firstName} {liveClass.instructor.lastName}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end space-y-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}>
              {statusInfo.status.charAt(0).toUpperCase() + statusInfo.status.slice(1)}
              {isLive && <i className="fas fa-circle ml-1 animate-pulse text-red-500"></i>}
            </span>

            {isLive && (
              <button
                onClick={() => joinVideoCall(liveClass._id)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors duration-200"
              >
                <i className="fas fa-video"></i>
                <span>Join Now</span>
              </button>
            )}

            {statusInfo.status === 'upcoming' && (
              <button
                onClick={() => navigate(`/live-classes/${liveClass._id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors duration-200"
              >
                <i className="fas fa-info-circle"></i>
                <span>Details</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading live classes...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Classes</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadLiveClasses}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
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
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Classes</h1>
            <p className="text-gray-600">Join live video classes and interact with teachers and students</p>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'upcoming'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Upcoming Classes ({upcomingClasses.length})
                </button>
                <button
                  onClick={() => setActiveTab('my-classes')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'my-classes'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Classes ({liveClasses.length})
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div>
            {activeTab === 'upcoming' && (
              <div>
                {upcomingClasses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-5xl mb-4">
                      <i className="fas fa-calendar-times"></i>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No Upcoming Classes</h3>
                    <p className="text-gray-600">Check back later for new live classes</p>
                  </div>
                ) : (
                  upcomingClasses.map(renderClassCard)
                )}
              </div>
            )}

            {activeTab === 'my-classes' && (
              <div>
                {liveClasses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-5xl mb-4">
                      <i className="fas fa-chalkboard-teacher"></i>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No Enrolled Classes</h3>
                    <p className="text-gray-600">Browse and join upcoming classes to get started</p>
                  </div>
                ) : (
                  liveClasses.map(renderClassCard)
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LiveClassesPage;
