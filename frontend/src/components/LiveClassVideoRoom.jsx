import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VideoCall from './VideoCall';
import liveClassService from '../services/liveClassService';

const LiveClassVideoRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveClass, setLiveClass] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isTeacher, setIsTeacher] = useState(false);
  const [roomDetails, setRoomDetails] = useState(null);
  const [leavingCall, setLeavingCall] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    joinVideoRoom();
    
    // Add window beforeunload event to notify users before leaving
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Handle cleanup when component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleLeaveCall(false);
    };
  }, [id]);

  // Show warning when user tries to leave page
  const handleBeforeUnload = (e) => {
    const message = "Leaving this page will disconnect you from the class. Are you sure?";
    e.returnValue = message;
    return message;
  };

  const joinVideoRoom = async () => {
    try {
      setLoading(true);
      setError(null);
      setReconnecting(false);

      // Fetch the live class details
      const classResponse = await liveClassService.getLiveClassById(id);
      const classData = classResponse.data.liveClass;
      setLiveClass(classData);

      // Check if user is the instructor
      const isInstructorCheck = 
        classData.instructor._id === currentUser.id ||
        classData.instructor.id === currentUser.id;
      setIsTeacher(isInstructorCheck);

      // Join the video call
      const joinResponse = await liveClassService.joinVideoCall(id);
      const { videoRoomDetails } = joinResponse.data;
      setRoomDetails(videoRoomDetails);

      // Get participants - handle both _id and id formats for compatibility
      const classParticipants = isInstructorCheck
        ? classData.participants.map(p => p.student || p)
        : [classData.instructor, ...classData.participants
            .filter(p => {
              const studentId = p.student?._id || p.student?.id || p._id || p.id;
              const userId = currentUser.id;
              return studentId !== userId;
            })
            .map(p => p.student || p)];
            
      setParticipants(classParticipants);
      setLoading(false);
    } catch (err) {
      console.error('Error joining video room:', err);
      setError(err.message || 'Failed to join video room');
      setLoading(false);
    }
  };

  const handleReconnect = async () => {
    setReconnecting(true);
    try {
      await joinVideoRoom();
    } catch (err) {
      console.error('Failed to reconnect:', err);
      setError('Failed to reconnect to the class. Please try again.');
    } finally {
      setReconnecting(false);
    }
  };

  const handleLeaveCall = async (shouldRedirect = true) => {
    if (leavingCall) return;
    
    try {
      setLeavingCall(true);
      
      // Leave the video call on the backend
      await liveClassService.leaveVideoCall(id);
      
      // Redirect to class details if requested
      if (shouldRedirect) {
        navigate(`/live-classes/${id}`);
      }
    } catch (err) {
      console.error('Error leaving video call:', err);
    } finally {
      setLeavingCall(false);
    }
  };

  if (loading || reconnecting) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="spinner w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{reconnecting ? 'Reconnecting to video call...' : 'Joining video call...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Failed to Join Class</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleReconnect}
              className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-md flex items-center"
              disabled={reconnecting}
            >
              <i className="fas fa-sync-alt mr-2"></i> Try Again
            </button>
            <button
              onClick={() => navigate(`/live-classes/${id}`)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-md"
            >
              Back to Class Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {liveClass && (
        <div className="bg-white border-b shadow-sm py-3 px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">{liveClass.title}</h1>
              <div className="flex items-center text-sm text-gray-600">
                {isTeacher ? (
                  <span className="flex items-center">
                    <i className="fas fa-chalkboard-teacher mr-1"></i> You are teaching this class
                  </span>
                ) : (
                  <span className="flex items-center">
                    <i className="fas fa-user-tie mr-1"></i> 
                    Instructor: {liveClass.instructor.firstName} {liveClass.instructor.lastName}
                  </span>
                )}
                
                {liveClass.language && (
                  <span className="ml-4 flex items-center">
                    <i className="fas fa-language mr-1"></i> 
                    {liveClass.language.charAt(0).toUpperCase() + liveClass.language.slice(1)}
                  </span>
                )}
                
                {liveClass.level && (
                  <span className="ml-4 flex items-center">
                    <i className="fas fa-layer-group mr-1"></i> 
                    Level: {liveClass.level}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full">
                <span className="inline-flex h-3 w-3 relative mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-sm font-medium">Live</span>
              </div>
              
              {participants.length > 0 && (
                <div className="ml-3 flex items-center bg-gray-100 px-3 py-1 rounded-full">
                  <i className="fas fa-users mr-2 text-gray-600"></i>
                  <span className="text-sm text-gray-600">
                    {participants.length + 1} {(participants.length + 1) === 1 ? 'participant' : 'participants'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1">
        {roomDetails && (
          <VideoCall
            roomId={roomDetails.roomId}
            participants={participants}
            onLeave={handleLeaveCall}
            showChat={true}
            isTeacher={isTeacher}
          />
        )}
      </div>
      
      {/* Class Information Panel (collapsed by default) */}
      {liveClass && liveClass.description && (
        <div className="bg-gray-50 border-t p-3">
          <details className="text-sm">
            <summary className="font-medium cursor-pointer text-blue-600 hover:text-blue-800">
              Class Information
            </summary>
            <div className="mt-2 text-gray-700">
              <p className="mb-2">{liveClass.description}</p>
              
              {liveClass.agenda && liveClass.agenda.length > 0 && (
                <div className="mt-2">
                  <h4 className="font-medium">Today's Agenda:</h4>
                  <ul className="list-disc list-inside ml-2">
                    {liveClass.agenda.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default LiveClassVideoRoom;
