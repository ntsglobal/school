import LiveClass from '../models/LiveClass.js';
import User from '../models/User.js';

// Get all live classes
export const getAllLiveClasses = async (req, res) => {
  try {
    const { language, level, instructor, status } = req.query;
    const filter = {};

    if (language) filter.language = language;
    if (level) filter.level = level;
    if (instructor) filter.instructor = instructor;
    if (status) filter.status = status;

    const liveClasses = await LiveClass.find(filter)
      .populate('instructor', 'firstName lastName avatar')
      .populate('participants.user', 'firstName lastName avatar')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      data: {
        liveClasses,
        count: liveClasses.length
      }
    });
  } catch (error) {
    console.error('Get all live classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live classes',
      error: error.message
    });
  }
};

// Get live class by ID
export const getLiveClassById = async (req, res) => {
  try {
    const { id } = req.params;

    const liveClass = await LiveClass.findById(id)
      .populate('instructor', 'firstName lastName avatar email')
      .populate('participants.user', 'firstName lastName avatar')
      .populate('course', 'title description');

    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { liveClass }
    });
  } catch (error) {
    console.error('Get live class by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live class',
      error: error.message
    });
  }
};

// Create new live class (Teacher/Admin only)
export const createLiveClass = async (req, res) => {
  try {
    const {
      title,
      description,
      course,
      language,
      level,
      scheduledDate,
      duration,
      maxParticipants,
      meetingUrl,
      agenda
    } = req.body;

    const liveClass = new LiveClass({
      title,
      description,
      course,
      language,
      level,
      instructor: req.user._id,
      scheduledDate,
      duration,
      maxParticipants,
      meetingUrl,
      agenda,
      status: 'scheduled'
    });

    await liveClass.save();
    
    await liveClass.populate('instructor', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Live class created successfully',
      data: { liveClass }
    });
  } catch (error) {
    console.error('Create live class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create live class',
      error: error.message
    });
  }
};

// Update live class (Teacher/Admin only)
export const updateLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const liveClass = await LiveClass.findById(id);
    
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    // Check if user is instructor or admin
    if (liveClass.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this live class'
      });
    }

    Object.assign(liveClass, updates);
    await liveClass.save();

    await liveClass.populate('instructor', 'firstName lastName avatar');

    res.status(200).json({
      success: true,
      message: 'Live class updated successfully',
      data: { liveClass }
    });
  } catch (error) {
    console.error('Update live class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update live class',
      error: error.message
    });
  }
};

// Delete live class (Admin only)
export const deleteLiveClass = async (req, res) => {
  try {
    const { id } = req.params;

    const liveClass = await LiveClass.findById(id);
    
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    await LiveClass.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Live class deleted successfully'
    });
  } catch (error) {
    console.error('Delete live class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete live class',
      error: error.message
    });
  }
};

// Join live class
export const joinLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const liveClass = await LiveClass.findById(id);
    
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    // Check if class is full
    if (liveClass.participants.length >= liveClass.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Live class is full'
      });
    }

    // Check if user is already joined
    const alreadyJoined = liveClass.participants.some(
      participant => participant.user.toString() === userId.toString()
    );

    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: 'Already joined this live class'
      });
    }

    // Add user to participants
    liveClass.participants.push({
      user: userId,
      joinedAt: new Date(),
      status: 'joined'
    });

    await liveClass.save();

    res.status(200).json({
      success: true,
      message: 'Successfully joined live class',
      data: { liveClass }
    });
  } catch (error) {
    console.error('Join live class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join live class',
      error: error.message
    });
  }
};

// Leave live class
export const leaveLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const liveClass = await LiveClass.findById(id);
    
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    // Remove user from participants
    liveClass.participants = liveClass.participants.filter(
      participant => participant.user.toString() !== userId.toString()
    );

    await liveClass.save();

    res.status(200).json({
      success: true,
      message: 'Successfully left live class'
    });
  } catch (error) {
    console.error('Leave live class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave live class',
      error: error.message
    });
  }
};

// Start live class (Instructor only)
export const startLiveClass = async (req, res) => {
  try {
    const { id } = req.params;

    const liveClass = await LiveClass.findById(id);
    
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    // Check if user is instructor
    if (liveClass.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only instructor can start the class'
      });
    }

    liveClass.status = 'ongoing';
    liveClass.actualStartTime = new Date();
    await liveClass.save();

    // Notify participants via socket
    const socketService = req.app.get('socketService');
    if (socketService) {
      liveClass.participants.forEach(participant => {
        socketService.sendToUser(participant.user, 'class_started', {
          classId: id,
          message: 'Your live class has started!'
        });
      });
    }

    res.status(200).json({
      success: true,
      message: 'Live class started successfully',
      data: { liveClass }
    });
  } catch (error) {
    console.error('Start live class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start live class',
      error: error.message
    });
  }
};

// End live class (Instructor only)
export const endLiveClass = async (req, res) => {
  try {
    const { id } = req.params;

    const liveClass = await LiveClass.findById(id);
    
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    // Check if user is instructor
    if (liveClass.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only instructor can end the class'
      });
    }

    liveClass.status = 'completed';
    liveClass.actualEndTime = new Date();
    await liveClass.save();

    res.status(200).json({
      success: true,
      message: 'Live class ended successfully',
      data: { liveClass }
    });
  } catch (error) {
    console.error('End live class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end live class',
      error: error.message
    });
  }
};

// Get live classes by instructor
export const getInstructorLiveClasses = async (req, res) => {
  try {
    const instructorId = req.params.instructorId || req.user._id;

    const liveClasses = await LiveClass.find({ instructor: instructorId })
      .populate('participants.user', 'firstName lastName avatar')
      .sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      data: {
        liveClasses,
        count: liveClasses.length
      }
    });
  } catch (error) {
    console.error('Get instructor live classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch instructor live classes',
      error: error.message
    });
  }
};

// Get user's joined live classes
export const getUserLiveClasses = async (req, res) => {
  try {
    const userId = req.user._id;

    const liveClasses = await LiveClass.find({
      'participants.user': userId
    })
      .populate('instructor', 'firstName lastName avatar')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      data: {
        liveClasses,
        count: liveClasses.length
      }
    });
  } catch (error) {
    console.error('Get user live classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user live classes',
      error: error.message
    });
  }
};

// Join video call for a live class
export const joinVideoCall = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const liveClass = await LiveClass.findById(id);
    
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }
    
    // Check if class is ongoing or scheduled to start within 5 minutes
    const now = new Date();
    const fiveMinutesBeforeStart = new Date(liveClass.scheduledAt);
    fiveMinutesBeforeStart.setMinutes(fiveMinutesBeforeStart.getMinutes() - 5);
    
    if (liveClass.status !== 'ongoing' && now < fiveMinutesBeforeStart) {
      return res.status(400).json({
        success: false,
        message: 'Video call is not available yet'
      });
    }
    
    // Check if user is instructor or participant
    const isInstructor = liveClass.instructor.toString() === userId.toString();
    const isParticipant = liveClass.participants.some(p => p.student.toString() === userId.toString());
    
    if (!isInstructor && !isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to join this video call'
      });
    }
    
    // Update user's video status
    if (isParticipant) {
      const participantIndex = liveClass.participants.findIndex(p => p.student.toString() === userId.toString());
      if (participantIndex !== -1) {
        liveClass.participants[participantIndex].videoStatus = {
          hasJoined: true,
          joinedVideoAt: new Date(),
          lastActivity: new Date(),
          mediaState: {
            video: true,
            audio: true,
            screenShare: false
          }
        };
        
        // Update status if not already attended
        if (liveClass.participants[participantIndex].status === 'registered') {
          liveClass.participants[participantIndex].status = 'attended';
        }
      }
    }
    
    // If class was scheduled but instructor joins, start it
    if (liveClass.status === 'scheduled' && isInstructor) {
      liveClass.status = 'ongoing';
      liveClass.actualStartTime = new Date();
    }
    
    await liveClass.save();
    
    // Generate room token if needed
    const videoRoomDetails = {
      roomId: liveClass._id.toString(),
      isInstructor,
      participants: liveClass.participants
        .filter(p => p.videoStatus && p.videoStatus.hasJoined)
        .map(p => ({
          id: p.student.toString(),
          joinedAt: p.videoStatus.joinedVideoAt
        }))
    };
    
    res.status(200).json({
      success: true,
      message: 'Joined video call successfully',
      data: {
        videoRoomDetails
      }
    });
    
  } catch (error) {
    console.error('Join video call error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join video call',
      error: error.message
    });
  }
};

// Leave video call
export const leaveVideoCall = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const liveClass = await LiveClass.findById(id);
    
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }
    
    // Check if user is instructor or participant
    const isInstructor = liveClass.instructor.toString() === userId.toString();
    
    if (isInstructor) {
      // If instructor leaves, don't update anything yet
      // They might come back and the class should continue
    } else {
      // Update participant status
      const participantIndex = liveClass.participants.findIndex(p => p.student.toString() === userId.toString());
      if (participantIndex !== -1 && liveClass.participants[participantIndex].videoStatus) {
        // Calculate attendance time
        const joinedAt = liveClass.participants[participantIndex].videoStatus.joinedVideoAt;
        const leftAt = new Date();
        
        if (joinedAt) {
          const attendanceTimeMinutes = Math.round((leftAt - joinedAt) / 60000); // convert ms to minutes
          liveClass.participants[participantIndex].attendanceTime = 
            (liveClass.participants[participantIndex].attendanceTime || 0) + attendanceTimeMinutes;
        }
        
        liveClass.participants[participantIndex].videoStatus.hasJoined = false;
        liveClass.participants[participantIndex].videoStatus.leftVideoAt = new Date();
        
        await liveClass.save();
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Left video call successfully'
    });
    
  } catch (error) {
    console.error('Leave video call error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave video call',
      error: error.message
    });
  }
};

// Get upcoming live classes
export const getUpcomingClasses = async (req, res) => {
  try {
    const now = new Date();
    const upcomingClasses = await LiveClass.find({
      scheduledDate: { $gte: now },
      status: { $in: ['scheduled', 'ongoing'] }
    })
      .populate('instructor', 'firstName lastName avatar')
      .sort({ scheduledDate: 1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        liveClasses: upcomingClasses,
        count: upcomingClasses.length
      }
    });
  } catch (error) {
    console.error('Get upcoming classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming classes',
      error: error.message
    });
  }
};
