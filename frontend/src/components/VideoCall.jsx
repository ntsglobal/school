import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import videoService from '../services/videoService';
import chatService from '../services/chatService';

const VideoCall = ({ 
  roomId, 
  participants = [], 
  onLeave,
  showChat = true,
  isTeacher = false 
}) => {
  const { user } = useAuth();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStates, setConnectionStates] = useState(new Map());
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef(new Map());
  const containerRef = useRef(null);

  useEffect(() => {
    initializeVideoCall();
    setupEventListeners();

    return () => {
      cleanup();
    };
  }, [roomId]);

  const initializeVideoCall = async () => {
    try {
      setError(null);
      
      // Initialize media and join room
      const stream = await videoService.initializeMedia({
        video: true,
        audio: true,
        // Set video constraints for better quality
        videoConstraints: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      });
      
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Join video room
      await videoService.joinVideoRoom(roomId, user.id);
      
      // Set up connection status tracking
      const initialConnectionStates = new Map();
      participants.forEach(participant => {
        initialConnectionStates.set(participant._id, 'connecting');
      });
      setConnectionStates(initialConnectionStates);
      
    } catch (err) {
      console.error('Error initializing video call:', err);
      setError('Failed to access camera/microphone. Please check permissions.');
    }
  };

  const setupEventListeners = () => {
    videoService.on('remote_stream_added', handleRemoteStreamAdded);
    videoService.on('user_left_video', handleUserLeftVideo);
    videoService.on('local_video_toggled', setIsVideoEnabled);
    videoService.on('local_audio_toggled', setIsAudioEnabled);
    videoService.on('screen_share_started', () => setIsScreenSharing(true));
    videoService.on('screen_share_stopped', () => setIsScreenSharing(false));
    videoService.on('connection_state_changed', handleConnectionStateChanged);
    videoService.on('video_error', handleVideoError);
    videoService.on('recording_started', () => setIsRecording(true));
    videoService.on('recording_stopped', () => setIsRecording(false));
  };

  const handleRemoteStreamAdded = ({ userId, stream }) => {
    setRemoteStreams(prev => new Map(prev.set(userId, stream)));
    
    // Set video element source
    setTimeout(() => {
      const videoElement = remoteVideoRefs.current.get(userId);
      if (videoElement) {
        videoElement.srcObject = stream;
      }
    }, 100);
  };

  const handleUserLeftVideo = ({ userId }) => {
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
    
    remoteVideoRefs.current.delete(userId);
  };

  const handleConnectionStateChanged = ({ userId, state }) => {
    setConnectionStates(prev => new Map(prev.set(userId, state)));
  };

  const handleVideoError = (error) => {
    console.error('Video error:', error);
    setError(error.message || 'Video call error occurred');
  };

  const toggleVideo = () => {
    videoService.toggleVideo();
  };

  const toggleAudio = () => {
    videoService.toggleAudio();
  };

  const startScreenShare = async () => {
    try {
      await videoService.startScreenShare();
    } catch (error) {
      console.error('Screen share error:', error);
      setError('Failed to start screen sharing');
    }
  };

  const stopScreenShare = () => {
    videoService.stopScreenShare();
  };

  const startRecording = () => {
    if (isTeacher) {
      videoService.startRecording();
    }
  };

  const stopRecording = () => {
    if (isTeacher) {
      videoService.stopRecording();
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const leaveCall = () => {
    cleanup();
    if (onLeave) onLeave();
  };

  const cleanup = () => {
    videoService.leaveVideoRoom();
    
    // Clean up video refs
    remoteVideoRefs.current.clear();
    
    // Remove event listeners
    videoService.off('remote_stream_added', handleRemoteStreamAdded);
    videoService.off('user_left_video', handleUserLeftVideo);
    videoService.off('local_video_toggled', setIsVideoEnabled);
    videoService.off('local_audio_toggled', setIsAudioEnabled);
    videoService.off('screen_share_started', () => setIsScreenSharing(true));
    videoService.off('screen_share_stopped', () => setIsScreenSharing(false));
    videoService.off('connection_state_changed', handleConnectionStateChanged);
    videoService.off('video_error', handleVideoError);
  };

  const getParticipantName = (userId) => {
    const participant = participants.find(p => p.id === userId || p._id === userId);
    return participant ? `${participant.firstName} ${participant.lastName}` : 'Unknown';
  };

  const renderVideoGrid = () => {
    const totalParticipants = 1 + remoteStreams.size; // +1 for local user
    const gridCols = Math.ceil(Math.sqrt(totalParticipants));
    
    return (
      <div 
        className={`grid gap-2 h-full ${
          gridCols === 1 ? 'grid-cols-1' :
          gridCols === 2 ? 'grid-cols-2' :
          gridCols === 3 ? 'grid-cols-3' :
          'grid-cols-4'
        }`}
      >
        {/* Local video */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            You {!isVideoEnabled && '(Video Off)'} {!isAudioEnabled && '(Muted)'}
          </div>
          {isScreenSharing && (
            <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
              Sharing Screen
            </div>
          )}
        </div>

        {/* Remote videos */}
        {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
          <div key={userId} className="relative bg-gray-900 rounded-lg overflow-hidden">
            <video
              ref={(el) => {
                if (el) {
                  remoteVideoRefs.current.set(userId, el);
                  el.srcObject = stream;
                }
              }}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              {getParticipantName(userId)}
            </div>
            
            {/* Connection status indicator */}
            <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
              connectionStates.get(userId) === 'connected' ? 'bg-green-500' :
              connectionStates.get(userId) === 'connecting' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}></div>
          </div>
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <i className="fas fa-exclamation-triangle text-4xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Video Call Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={initializeVideoCall}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-gray-100">
      {/* Video Grid */}
      <div className="flex-1 p-4">
        {renderVideoGrid()}
      </div>

      {/* Controls */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center justify-between">
          {/* Left controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-full ${
                isAudioEnabled 
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title={isAudioEnabled ? 'Mute' : 'Unmute'}
            >
              <i className={`fas ${isAudioEnabled ? 'fa-microphone' : 'fa-microphone-slash'}`}></i>
            </button>

            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full ${
                isVideoEnabled 
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              <i className={`fas ${isVideoEnabled ? 'fa-video' : 'fa-video-slash'}`}></i>
            </button>

            {isTeacher && (
              <>
                <button
                  onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                  className={`p-3 rounded-full ${
                    isScreenSharing 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                  title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                >
                  <i className="fas fa-desktop"></i>
                </button>

                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-3 rounded-full ${
                    isRecording 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                  title={isRecording ? 'Stop recording' : 'Start recording'}
                >
                  <i className={`fas ${isRecording ? 'fa-stop' : 'fa-record-vinyl'}`}></i>
                </button>
              </>
            )}
          </div>

          {/* Center info */}
          <div className="text-center">
            <div className="text-sm text-gray-600">
              {remoteStreams.size + 1} participant{remoteStreams.size !== 0 ? 's' : ''}
            </div>
            {isRecording && (
              <div className="text-red-600 text-sm font-medium">
                <i className="fas fa-circle animate-pulse mr-1"></i>
                Recording
              </div>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
              title="Toggle fullscreen"
            >
              <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
            </button>

            <button
              onClick={leaveCall}
              className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white"
              title="Leave call"
            >
              <i className="fas fa-phone-slash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
