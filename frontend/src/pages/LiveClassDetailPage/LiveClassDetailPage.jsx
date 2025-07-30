import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import liveClassService from '../../services/liveClassService';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const LiveClassDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [liveClass, setLiveClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    loadLiveClass();
  }, [id]);

  const loadLiveClass = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await liveClassService.getLiveClassById(id);
      setLiveClass(response.data.liveClass);
    } catch (err) {
      console.error('Error loading live class:', err);
      setError('Failed to load live class details');
    } finally {
      setLoading(false);
    }
  };

  const joinClass = async () => {
    try {
      setIsJoining(true);
      await liveClassService.joinLiveClass(id);
      
      // Reload class details to update participant list
      await loadLiveClass();
    } catch (err) {
      console.error('Error joining class:', err);
      alert('Failed to join class');
    } finally {
      setIsJoining(false);
    }
  };

  const joinVideoCall = () => {
    navigate(`/live-classes/${id}/video`);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const isUserEnrolled = () => {
    return liveClass?.participants?.some(p => 
      (p.student?._id || p.student?.id) === currentUser.id
    );
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading class details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !liveClass) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Class Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'The requested class could not be found.'}</p>
            <button
              onClick={() => navigate('/live-classes')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Back to Live Classes
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const statusInfo = getClassStatus(liveClass.scheduledAt || liveClass.scheduledDate, liveClass.duration);
  const isLive = statusInfo.status === 'live';
  const isEnrolled = isUserEnrolled();

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/live-classes')}
            className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Live Classes
          </button>

          {/* Class Header */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{liveClass.title}</h1>
                <p className="text-gray-700 text-lg mb-4">{liveClass.description}</p>
                
                <div className="flex items-center space-x-1 mb-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                    {statusInfo.status.charAt(0).toUpperCase() + statusInfo.status.slice(1)}
                    {isLive && <i className="fas fa-circle ml-2 animate-pulse text-red-500"></i>}
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                {isLive && isEnrolled && (
                  <button
                    onClick={joinVideoCall}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors duration-200"
                  >
                    <i className="fas fa-video"></i>
                    <span>Join Video Call</span>
                  </button>
                )}

                {!isEnrolled && statusInfo.status === 'upcoming' && (
                  <button
                    onClick={joinClass}
                    disabled={isJoining}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors duration-200"
                  >
                    {isJoining ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Joining...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus"></i>
                        <span>Join Class</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Class Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="flex items-center space-x-3">
                <div className="text-blue-600 text-xl">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium">{formatDateTime(liveClass.scheduledAt || liveClass.scheduledDate)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-green-600 text-xl">
                  <i className="fas fa-language"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Language</p>
                  <p className="font-medium">{liveClass.language?.charAt(0).toUpperCase() + liveClass.language?.slice(1)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-purple-600 text-xl">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Level</p>
                  <p className="font-medium">{liveClass.level}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-orange-600 text-xl">
                  <i className="fas fa-clock"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{liveClass.duration} minutes</p>
                </div>
              </div>
            </div>

            {/* Instructor */}
            {liveClass.instructor && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructor</h3>
                <div className="flex items-center space-x-4">
                  <img
                    src={liveClass.instructor.avatar || '/images/users/default-avatar.png'}
                    alt={`${liveClass.instructor.firstName} ${liveClass.instructor.lastName}`}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {liveClass.instructor.firstName} {liveClass.instructor.lastName}
                    </p>
                    <p className="text-gray-600">Language Instructor</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Participants */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Participants ({liveClass.participants?.length || 0}/{liveClass.maxParticipants})
            </h3>
            
            {liveClass.participants && liveClass.participants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveClass.participants.map((participant, index) => {
                  const student = participant.student || participant;
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={student.avatar || '/images/users/default-avatar.png'}
                        alt={`${student.firstName} ${student.lastName}`}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-gray-600">Student</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-3xl mb-2">
                  <i className="fas fa-users"></i>
                </div>
                <p className="text-gray-600">No participants yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LiveClassDetailPage;
