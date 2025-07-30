import Buddy from '../models/Buddy.js';
import BuddyConnection from '../models/BuddyConnection.js';
import User from '../models/User.js';

// Create or update buddy profile
export const createBuddyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      targetLanguage,
      currentLevel,
      learningGoals,
      timezone,
      availableHours,
      interests,
      bio,
      ageRange,
      preferredGender,
      preferredLearningStyle,
      matchingPreferences
    } = req.body;

    // Validate required fields
    if (!targetLanguage || !currentLevel || !timezone) {
      return res.status(400).json({
        success: false,
        message: 'Target language, current level, and timezone are required'
      });
    }

    // Check if buddy profile already exists
    let buddyProfile = await Buddy.findOne({ userId });
    
    if (buddyProfile) {
      // Update existing profile
      Object.assign(buddyProfile, {
        targetLanguage,
        currentLevel,
        learningGoals: learningGoals || [],
        timezone,
        availableHours: availableHours || [],
        interests: interests || [],
        bio: bio || '',
        ageRange: ageRange || { min: 13, max: 25 },
        preferredGender: preferredGender || 'any',
        preferredLearningStyle: preferredLearningStyle || 'mixed',
        matchingPreferences: matchingPreferences || { priorityFactors: ['level', 'timezone'], autoAcceptMatches: false },
        lastActiveDate: new Date()
      });
    } else {
      // Create new profile
      buddyProfile = new Buddy({
        userId,
        targetLanguage,
        currentLevel,
        learningGoals: learningGoals || [],
        timezone,
        availableHours: availableHours || [],
        interests: interests || [],
        bio: bio || '',
        ageRange: ageRange || { min: 13, max: 25 },
        preferredGender: preferredGender || 'any',
        preferredLearningStyle: preferredLearningStyle || 'mixed',
        matchingPreferences: matchingPreferences || { priorityFactors: ['level', 'timezone'], autoAcceptMatches: false }
      });
    }

    await buddyProfile.save();

    res.json({
      success: true,
      message: 'Buddy profile saved successfully',
      data: buddyProfile
    });
  } catch (error) {
    console.error('Create buddy profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating buddy profile'
    });
  }
};

// Get user's buddy profile
export const getBuddyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const buddyProfile = await Buddy.findOne({ userId }).populate('userId', 'firstName lastName avatar grade');
    
    if (!buddyProfile) {
      return res.status(404).json({
        success: false,
        message: 'Buddy profile not found'
      });
    }

    res.json({
      success: true,
      data: buddyProfile
    });
  } catch (error) {
    console.error('Get buddy profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching buddy profile'
    });
  }
};

// Find potential buddies
export const findBuddies = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      language, 
      level, 
      timezone, 
      interests, 
      limit = 10,
      ageMin,
      ageMax 
    } = req.query;

    // Get user's buddy profile
    const userBuddy = await Buddy.findOne({ userId, isActive: true });
    
    if (!userBuddy) {
      return res.status(404).json({
        success: false,
        message: 'Please create a buddy profile first'
      });
    }

    // Build search criteria
    const searchCriteria = {
      userId: { $ne: userId },
      isActive: true,
      currentBuddies: { $nin: [userId] }
    };

    // Use filters or fall back to user's preferences
    searchCriteria.targetLanguage = language || userBuddy.targetLanguage;
    
    if (level) {
      searchCriteria.currentLevel = level;
    }
    
    if (timezone) {
      searchCriteria.timezone = timezone;
    }
    
    if (interests && interests.length > 0) {
      const interestArray = Array.isArray(interests) ? interests : [interests];
      searchCriteria.interests = { $in: interestArray };
    }

    // Find potential matches
    const potentialMatches = await Buddy.find(searchCriteria)
      .populate('userId', 'firstName lastName avatar grade dateOfBirth')
      .limit(parseInt(limit) * 2); // Get more to filter and sort

    // Calculate match scores and sort
    const matchesWithScores = potentialMatches.map(match => {
      const matchScore = userBuddy.calculateMatchScore(match);
      return {
        id: match.userId._id,
        firstName: match.userId.firstName,
        lastName: match.userId.lastName,
        avatar: match.userId.avatar,
        grade: match.userId.grade,
        targetLanguage: match.targetLanguage,
        currentLevel: match.currentLevel,
        interests: match.interests,
        timezone: match.timezone,
        bio: match.bio,
        averageRating: match.averageRating,
        totalSessions: match.totalSessions,
        matchScore,
        buddyId: match._id
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    // Apply age filters if provided
    let filteredMatches = matchesWithScores;
    if (ageMin || ageMax) {
      filteredMatches = matchesWithScores.filter(match => {
        if (!match.dateOfBirth) return true; // Include if age unknown
        
        const age = Math.floor((Date.now() - new Date(match.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000));
        
        if (ageMin && age < parseInt(ageMin)) return false;
        if (ageMax && age > parseInt(ageMax)) return false;
        
        return true;
      });
    }

    res.json({
      success: true,
      data: {
        matches: filteredMatches.slice(0, parseInt(limit)),
        total: filteredMatches.length,
        filters: {
          language: language || userBuddy.targetLanguage,
          level,
          timezone,
          interests,
          ageRange: { min: ageMin, max: ageMax }
        }
      }
    });
  } catch (error) {
    console.error('Find buddies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while finding buddies'
    });
  }
};

// Send buddy connection request
export const sendBuddyRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { receiverId, message } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID is required'
      });
    }

    if (userId === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send buddy request to yourself'
      });
    }

    // Check if connection already exists
    const existingConnection = await BuddyConnection.getConnectionBetween(userId, receiverId);
    
    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: 'Connection already exists between these users'
      });
    }

    // Get both users' buddy profiles
    const [requesterBuddy, receiverBuddy] = await Promise.all([
      Buddy.findOne({ userId }),
      Buddy.findOne({ userId: receiverId })
    ]);

    if (!requesterBuddy || !receiverBuddy) {
      return res.status(404).json({
        success: false,
        message: 'One or both users do not have buddy profiles'
      });
    }

    // Calculate match score
    const matchScore = requesterBuddy.calculateMatchScore(receiverBuddy);

    // Create connection request
    const connection = new BuddyConnection({
      requester: userId,
      receiver: receiverId,
      language: requesterBuddy.targetLanguage,
      matchScore,
      notes: message || ''
    });

    await connection.save();

    // Populate the connection with user details
    await connection.populate('requester', 'firstName lastName avatar');
    await connection.populate('receiver', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'Buddy request sent successfully',
      data: connection
    });
  } catch (error) {
    console.error('Send buddy request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending buddy request'
    });
  }
};

// Respond to buddy request
export const respondToBuddyRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { connectionId } = req.params;
    const { action, message } = req.body; // action: 'accept' or 'decline'

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "accept" or "decline"'
      });
    }

    const connection = await BuddyConnection.findById(connectionId);
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found'
      });
    }

    // Verify the user is the receiver
    if (connection.receiver.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this request'
      });
    }

    // Check if already responded
    if (connection.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request has already been responded to'
      });
    }

    // Update connection status
    if (action === 'accept') {
      await connection.accept();
      
      // Add each user to the other's current buddies list
      await Promise.all([
        Buddy.findOneAndUpdate(
          { userId: connection.requester },
          { $addToSet: { currentBuddies: connection.receiver } }
        ),
        Buddy.findOneAndUpdate(
          { userId: connection.receiver },
          { $addToSet: { currentBuddies: connection.requester } }
        )
      ]);
    } else {
      await connection.decline();
    }

    if (message) {
      connection.notes = (connection.notes || '') + `\nResponse: ${message}`;
      await connection.save();
    }

    await connection.populate('requester', 'firstName lastName avatar');
    await connection.populate('receiver', 'firstName lastName avatar');

    res.json({
      success: true,
      message: `Buddy request ${action}ed successfully`,
      data: connection
    });
  } catch (error) {
    console.error('Respond to buddy request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while responding to buddy request'
    });
  }
};

// Get user's buddy connections
export const getBuddyConnections = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query; // 'pending', 'accepted', 'declined', etc.

    const connections = await BuddyConnection.findUserConnections(userId, status);

    // Separate different types of connections
    const result = {
      received: connections.filter(c => c.receiver.toString() === userId && c.status === 'pending'),
      sent: connections.filter(c => c.requester.toString() === userId && c.status === 'pending'),
      active: connections.filter(c => c.status === 'accepted'),
      all: connections
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get buddy connections error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching connections'
    });
  }
};

// Get buddy statistics
export const getBuddyStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [buddyProfile, connectionStats] = await Promise.all([
      Buddy.findOne({ userId }),
      BuddyConnection.getUserStats(userId)
    ]);

    if (!buddyProfile) {
      return res.status(404).json({
        success: false,
        message: 'Buddy profile not found'
      });
    }

    const stats = {
      profile: {
        targetLanguage: buddyProfile.targetLanguage,
        currentLevel: buddyProfile.currentLevel,
        totalSessions: buddyProfile.totalSessions,
        averageRating: buddyProfile.averageRating
      },
      connections: connectionStats,
      recentActivity: [] // Can be enhanced with recent activity data
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get buddy stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
};

// End buddy connection
export const endBuddyConnection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { connectionId } = req.params;
    const { reason, rating, feedback } = req.body;

    const connection = await BuddyConnection.findById(connectionId);
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    // Verify user is part of this connection
    if (connection.requester.toString() !== userId && connection.receiver.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to end this connection'
      });
    }

    // End the connection
    await connection.end(reason);

    // Add rating if provided
    if (rating) {
      await connection.rate(userId, rating, feedback);
    }

    // Remove from current buddies lists
    const otherUserId = connection.requester.toString() === userId ? connection.receiver : connection.requester;
    
    await Promise.all([
      Buddy.findOneAndUpdate(
        { userId },
        { 
          $pull: { currentBuddies: otherUserId },
          $push: { 
            pastBuddies: { 
              buddy: otherUserId, 
              endDate: new Date(),
              rating: rating || null
            }
          }
        }
      ),
      Buddy.findOneAndUpdate(
        { userId: otherUserId },
        { $pull: { currentBuddies: userId } }
      )
    ]);

    res.json({
      success: true,
      message: 'Buddy connection ended successfully'
    });
  } catch (error) {
    console.error('End buddy connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while ending connection'
    });
  }
};

// Get recent activity
export const getRecentActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // Get recent connections and activities
    const recentConnections = await BuddyConnection.find({
      $or: [
        { requester: userId },
        { receiver: userId }
      ]
    })
    .sort({ updatedAt: -1 })
    .limit(parseInt(limit))
    .populate('requester', 'firstName lastName avatar')
    .populate('receiver', 'firstName lastName avatar');

    const activity = recentConnections.map(conn => {
      const isRequester = conn.requester._id.toString() === userId;
      const otherUser = isRequester ? conn.receiver : conn.requester;
      
      let action = '';
      let timestamp = conn.updatedAt;
      
      if (conn.status === 'pending' && isRequester) {
        action = 'sent_request';
        timestamp = conn.requestedAt;
      } else if (conn.status === 'pending' && !isRequester) {
        action = 'received_request';
        timestamp = conn.requestedAt;
      } else if (conn.status === 'accepted') {
        action = 'connection_accepted';
        timestamp = conn.respondedAt;
      } else if (conn.status === 'declined') {
        action = 'connection_declined';
        timestamp = conn.respondedAt;
      }
      
      return {
        id: conn._id,
        action,
        otherUser: {
          id: otherUser._id,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          avatar: otherUser.avatar
        },
        timestamp,
        language: conn.language,
        matchScore: conn.matchScore
      };
    });

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent activity'
    });
  }
};
