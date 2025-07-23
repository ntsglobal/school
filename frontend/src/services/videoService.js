import chatService from './chatService.js';

class VideoService {
  constructor() {
    this.localStream = null;
    this.remoteStreams = new Map(); // userId -> MediaStream
    this.peerConnections = new Map(); // userId -> RTCPeerConnection
    this.isVideoEnabled = true;
    this.isAudioEnabled = true;
    this.isScreenSharing = false;
    this.screenStream = null;
    this.currentRoom = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    
    // WebRTC configuration
    this.rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    };

    this.eventListeners = new Map();
    this.setupSocketHandlers();
  }

  // Event management
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in video service event listener:', error);
        }
      });
    }
  }

  // Setup socket handlers for video signaling
  setupSocketHandlers() {
    chatService.on('video_offer', this.handleVideoOffer.bind(this));
    chatService.on('video_answer', this.handleVideoAnswer.bind(this));
    chatService.on('ice_candidate', this.handleIceCandidate.bind(this));
    chatService.on('user_joined_video', this.handleUserJoinedVideo.bind(this));
    chatService.on('user_left_video', this.handleUserLeftVideo.bind(this));
    chatService.on('video_state_changed', this.handleVideoStateChanged.bind(this));
    chatService.on('screen_share_started', this.handleScreenShareStarted.bind(this));
    chatService.on('screen_share_stopped', this.handleScreenShareStopped.bind(this));
    chatService.on('video_room_participants', this.handleVideoRoomParticipants.bind(this));
  }
  
  // Handle existing room participants
  handleVideoRoomParticipants(data) {
    const { participants } = data;
    console.log('Received existing participants:', participants);
    
    // Create offer for each existing participant
    participants.forEach(userId => {
      this.createOffer(userId);
    });
    
    this.emit('room_participants', participants);
  }

  // Initialize local media stream
  async initializeMedia(options = {}) {
    try {
      const constraints = {
        video: options.videoConstraints || options.video || true,
        audio: options.audioConstraints || options.audio || true
      };
      
      // Request media permissions with enhanced quality
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.isVideoEnabled = !!constraints.video;
      this.isAudioEnabled = !!constraints.audio;
      
      // Apply bandwidth constraints if needed
      if (options.bandwidth && options.bandwidth.video) {
        this.localStream.getVideoTracks().forEach(track => {
          const sender = Array.from(this.peerConnections.values())
            .map(pc => pc.getSenders().find(s => s.track && s.track.kind === 'video'))
            .find(s => s);
          
          if (sender) {
            const params = sender.getParameters();
            if (!params.encodings) params.encodings = [{}];
            params.encodings[0].maxBitrate = options.bandwidth.video * 1000;
            sender.setParameters(params);
          }
        });
      }
      
      this.emit('local_stream_ready', this.localStream);
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      this.emit('media_error', error);
      throw error;
    }
  }

  // Join video room
  async joinVideoRoom(roomId, userId) {
    try {
      this.currentRoom = roomId;
      
      if (!this.localStream) {
        await this.initializeMedia();
      }

      // Notify server about joining video room
      chatService.socket?.emit('join_video_room', {
        roomId,
        userId,
        mediaState: {
          video: this.isVideoEnabled,
          audio: this.isAudioEnabled
        }
      });

      this.emit('joined_video_room', { roomId, userId });
    } catch (error) {
      console.error('Error joining video room:', error);
      this.emit('video_error', error);
    }
  }

  // Leave video room
  leaveVideoRoom() {
    if (this.currentRoom) {
      // Close all peer connections
      this.peerConnections.forEach((pc, userId) => {
        pc.close();
      });
      this.peerConnections.clear();
      this.remoteStreams.clear();

      // Notify server
      chatService.socket?.emit('leave_video_room', {
        roomId: this.currentRoom
      });

      this.currentRoom = null;
      this.emit('left_video_room');
    }
  }

  // Create peer connection
  createPeerConnection(userId) {
    const pc = new RTCPeerConnection(this.rtcConfig);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      this.remoteStreams.set(userId, remoteStream);
      this.emit('remote_stream_added', { userId, stream: remoteStream });
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        chatService.socket?.emit('ice_candidate', {
          roomId: this.currentRoom,
          targetUserId: userId,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${userId}:`, pc.connectionState);
      this.emit('connection_state_changed', {
        userId,
        state: pc.connectionState
      });
    };

    this.peerConnections.set(userId, pc);
    return pc;
  }

  // Create and send offer
  async createOffer(userId) {
    try {
      const pc = this.createPeerConnection(userId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      chatService.socket?.emit('video_offer', {
        roomId: this.currentRoom,
        targetUserId: userId,
        offer: offer
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  // Handle incoming video offer
  async handleVideoOffer(data) {
    try {
      const { fromUserId, offer } = data;
      const pc = this.createPeerConnection(fromUserId);
      
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      chatService.socket?.emit('video_answer', {
        roomId: this.currentRoom,
        targetUserId: fromUserId,
        answer: answer
      });
    } catch (error) {
      console.error('Error handling video offer:', error);
    }
  }

  // Handle incoming video answer
  async handleVideoAnswer(data) {
    try {
      const { fromUserId, answer } = data;
      const pc = this.peerConnections.get(fromUserId);
      
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error('Error handling video answer:', error);
    }
  }

  // Handle ICE candidate
  async handleIceCandidate(data) {
    try {
      const { fromUserId, candidate } = data;
      const pc = this.peerConnections.get(fromUserId);
      
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  // Handle user joined video
  handleUserJoinedVideo(data) {
    const { userId, mediaState } = data;
    this.emit('user_joined_video', { userId, mediaState });
    
    // Create offer for new user
    this.createOffer(userId);
  }

  // Handle user left video
  handleUserLeftVideo(data) {
    const { userId } = data;
    
    // Close peer connection
    const pc = this.peerConnections.get(userId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(userId);
    }
    
    // Remove remote stream
    this.remoteStreams.delete(userId);
    
    this.emit('user_left_video', { userId });
  }

  // Handle video state changes
  handleVideoStateChanged(data) {
    const { userId, mediaState } = data;
    this.emit('video_state_changed', { userId, mediaState });
  }

  // Toggle video
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.isVideoEnabled = videoTrack.enabled;
        
        // Notify other participants
        chatService.socket?.emit('video_state_changed', {
          roomId: this.currentRoom,
          mediaState: {
            video: this.isVideoEnabled,
            audio: this.isAudioEnabled
          }
        });
        
        this.emit('local_video_toggled', this.isVideoEnabled);
      }
    }
  }

  // Toggle audio
  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.isAudioEnabled = audioTrack.enabled;
        
        // Notify other participants
        chatService.socket?.emit('video_state_changed', {
          roomId: this.currentRoom,
          mediaState: {
            video: this.isVideoEnabled,
            audio: this.isAudioEnabled
          }
        });
        
        this.emit('local_audio_toggled', this.isAudioEnabled);
      }
    }
  }

  // Start screen sharing
  async startScreenShare() {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Replace video track in all peer connections
      const videoTrack = this.screenStream.getVideoTracks()[0];
      
      this.peerConnections.forEach(async (pc) => {
        const sender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      });

      this.isScreenSharing = true;
      
      // Handle screen share end
      videoTrack.onended = () => {
        this.stopScreenShare();
      };

      // Notify other participants
      chatService.socket?.emit('screen_share_started', {
        roomId: this.currentRoom
      });

      this.emit('screen_share_started');
    } catch (error) {
      console.error('Error starting screen share:', error);
      this.emit('screen_share_error', error);
    }
  }

  // Stop screen sharing
  async stopScreenShare() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    // Replace with camera video
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      
      this.peerConnections.forEach(async (pc) => {
        const sender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }
      });
    }

    this.isScreenSharing = false;

    // Notify other participants
    chatService.socket?.emit('screen_share_stopped', {
      roomId: this.currentRoom
    });

    this.emit('screen_share_stopped');
  }

  // Handle screen share events
  handleScreenShareStarted(data) {
    const { userId } = data;
    this.emit('remote_screen_share_started', { userId });
  }

  handleScreenShareStopped(data) {
    const { userId } = data;
    this.emit('remote_screen_share_stopped', { userId });
  }

  // Start recording
  startRecording() {
    if (this.localStream) {
      this.recordedChunks = [];
      
      this.mediaRecorder = new MediaRecorder(this.localStream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, {
          type: 'video/webm'
        });
        
        this.emit('recording_ready', blob);
      };

      this.mediaRecorder.start();
      this.emit('recording_started');
    }
  }

  // Stop recording
  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.emit('recording_stopped');
    }
  }

  // Get local stream
  getLocalStream() {
    return this.localStream;
  }

  // Get remote stream
  getRemoteStream(userId) {
    return this.remoteStreams.get(userId);
  }

  // Get all remote streams
  getAllRemoteStreams() {
    return Array.from(this.remoteStreams.entries()).map(([userId, stream]) => ({
      userId,
      stream
    }));
  }

  // Cleanup
  cleanup() {
    this.leaveVideoRoom();
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }
    
    this.eventListeners.clear();
  }
}

// Create singleton instance
const videoService = new VideoService();
export default videoService;
