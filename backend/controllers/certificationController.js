import Certification from '../models/Certification.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/response.js';
import crypto from 'crypto';

// Get user certifications
const getUserCertifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const certifications = await Certification.find({ 
      student: userId,
      isActive: true 
    })
    .sort({ issuedDate: -1 })
    .populate('language', 'name code flag')
    .populate('course', 'title');
    
    successResponse(res, certifications, 'Certifications retrieved successfully');
  } catch (error) {
    console.error('Error fetching user certifications:', error);
    errorResponse(res, 'Failed to fetch certifications', 500);
  }
};

// Get certification by ID
const getCertificationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const certification = await Certification.findById(id)
      .populate('student', 'name email')
      .populate('language', 'name code flag')
      .populate('course', 'title description')
      .populate('issuedBy', 'name');
    
    if (!certification) {
      return errorResponse(res, 'Certification not found', 404);
    }
    
    successResponse(res, certification, 'Certification retrieved successfully');
  } catch (error) {
    console.error('Error fetching certification:', error);
    errorResponse(res, 'Failed to fetch certification', 500);
  }
};

// Verify certification
const verifyCertification = async (req, res) => {
  try {
    const { verificationCode } = req.params;
    
    const certification = await Certification.findOne({ 
      verificationCode,
      isActive: true 
    })
    .populate('student', 'name email')
    .populate('language', 'name code flag')
    .populate('course', 'title');
    
    if (!certification) {
      return errorResponse(res, 'Invalid verification code', 404);
    }
    
    // Check if certification is still valid
    if (certification.expiryDate && new Date() > certification.expiryDate) {
      return errorResponse(res, 'Certification has expired', 400);
    }
    
    const response = {
      isValid: true,
      certification: {
        id: certification._id,
        studentName: certification.student.name,
        language: certification.language.name,
        cefrLevel: certification.cefrLevel,
        course: certification.course?.title,
        issuedDate: certification.issuedDate,
        expiryDate: certification.expiryDate,
        score: certification.assessment.score,
        grade: certification.grade
      }
    };
    
    successResponse(res, response, 'Certification verified successfully');
  } catch (error) {
    console.error('Error verifying certification:', error);
    errorResponse(res, 'Failed to verify certification', 500);
  }
};

// Issue new certification
const issueCertification = async (req, res) => {
  try {
    const {
      studentId,
      language,
      cefrLevel,
      course,
      assessmentData,
      grade
    } = req.body;
    
    const issuerId = req.user.id;
    
    // Validate student exists
    const student = await User.findById(studentId);
    if (!student) {
      return errorResponse(res, 'Student not found', 404);
    }
    
    // Generate verification code
    const verificationCode = crypto.randomBytes(16).toString('hex').toUpperCase();
    
    // Calculate expiry date (2 years from issue date)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 2);
    
    const certification = new Certification({
      student: studentId,
      language,
      cefrLevel,
      course,
      grade,
      assessment: assessmentData,
      issuedBy: issuerId,
      verificationCode,
      expiryDate
    });
    
    const savedCertification = await certification.save();
    const populatedCertification = await Certification.findById(savedCertification._id)
      .populate('student', 'name email')
      .populate('language', 'name code flag')
      .populate('course', 'title')
      .populate('issuedBy', 'name');
    
    // Update user's certification count
    await User.findByIdAndUpdate(studentId, {
      $inc: { 'achievements.certificationsEarned': 1 }
    });
    
    successResponse(res, populatedCertification, 'Certification issued successfully', 201);
  } catch (error) {
    console.error('Error issuing certification:', error);
    errorResponse(res, 'Failed to issue certification', 500);
  }
};

// Get certifications by language
const getCertificationsByLanguage = async (req, res) => {
  try {
    const { languageId } = req.params;
    const { page = 1, limit = 10, cefrLevel } = req.query;
    
    let query = { 
      language: languageId,
      isActive: true 
    };
    
    if (cefrLevel) {
      query.cefrLevel = cefrLevel;
    }
    
    const skip = (page - 1) * limit;
    
    const certifications = await Certification.find(query)
      .sort({ issuedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('student', 'name')
      .populate('language', 'name code flag')
      .populate('course', 'title');
    
    const total = await Certification.countDocuments(query);
    
    const response = {
      certifications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    };
    
    successResponse(res, response, 'Certifications retrieved successfully');
  } catch (error) {
    console.error('Error fetching certifications by language:', error);
    errorResponse(res, 'Failed to fetch certifications', 500);
  }
};

// Get certification statistics
const getCertificationStats = async (req, res) => {
  try {
    const stats = await Certification.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalCertifications: { $sum: 1 },
          averageScore: { $avg: '$assessment.score' },
          languageDistribution: {
            $push: '$language'
          },
          cefrLevelDistribution: {
            $push: '$cefrLevel'
          }
        }
      }
    ]);
    
    // Get language-wise stats
    const languageStats = await Certification.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 },
          averageScore: { $avg: '$assessment.score' }
        }
      },
      {
        $lookup: {
          from: 'languages',
          localField: '_id',
          foreignField: '_id',
          as: 'languageInfo'
        }
      }
    ]);
    
    // Get CEFR level stats
    const cefrStats = await Certification.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$cefrLevel',
          count: { $sum: 1 },
          averageScore: { $avg: '$assessment.score' }
        }
      }
    ]);
    
    const response = {
      overview: stats[0] || { totalCertifications: 0, averageScore: 0 },
      languageStats,
      cefrStats
    };
    
    successResponse(res, response, 'Certification statistics retrieved successfully');
  } catch (error) {
    console.error('Error fetching certification stats:', error);
    errorResponse(res, 'Failed to fetch certification statistics', 500);
  }
};

// Generate digital badge
const generateDigitalBadge = async (req, res) => {
  try {
    const { id } = req.params;
    const certification = await Certification.findById(id)
      .populate('student', 'name')
      .populate('language', 'name code')
      .populate('course', 'title');
    
    if (!certification) {
      return errorResponse(res, 'Certification not found', 404);
    }
    
    // Generate badge data
    const badgeData = {
      certificationId: certification._id,
      studentName: certification.student.name,
      language: certification.language.name,
      cefrLevel: certification.cefrLevel,
      issuedDate: certification.issuedDate,
      verificationUrl: `${process.env.FRONTEND_URL}/verify/${certification.verificationCode}`,
      badgeImage: `${process.env.CDN_URL}/badges/${certification.language.code}-${certification.cefrLevel}.png`
    };
    
    successResponse(res, badgeData, 'Digital badge generated successfully');
  } catch (error) {
    console.error('Error generating digital badge:', error);
    errorResponse(res, 'Failed to generate digital badge', 500);
  }
};

// Share certification
const shareCertification = async (req, res) => {
  try {
    const { id } = req.params;
    const { platform } = req.body; // 'linkedin', 'twitter', 'facebook', 'email'
    
    const certification = await Certification.findById(id)
      .populate('student', 'name')
      .populate('language', 'name')
      .populate('course', 'title');
    
    if (!certification) {
      return errorResponse(res, 'Certification not found', 404);
    }
    
    // Check if user owns this certification
    if (certification.student._id.toString() !== req.user.id) {
      return errorResponse(res, 'Unauthorized to share this certification', 403);
    }
    
    const shareData = {
      title: `${certification.language.name} ${certification.cefrLevel} Certification`,
      description: `I've successfully completed ${certification.language.name} language certification at ${certification.cefrLevel} level!`,
      url: `${process.env.FRONTEND_URL}/verify/${certification.verificationCode}`,
      image: `${process.env.CDN_URL}/badges/${certification.language.code}-${certification.cefrLevel}.png`
    };
    
    // Generate platform-specific share URLs
    const shareUrls = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.description)}&url=${encodeURIComponent(shareData.url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
      email: `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.description + '\n\n' + shareData.url)}`
    };
    
    const response = {
      shareData,
      shareUrl: shareUrls[platform] || shareUrls.linkedin
    };
    
    // Update share count
    certification.shareCount += 1;
    await certification.save();
    
    successResponse(res, response, 'Share data generated successfully');
  } catch (error) {
    console.error('Error sharing certification:', error);
    errorResponse(res, 'Failed to generate share data', 500);
  }
};

// Revoke certification (Admin only)
const revokeCertification = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const certification = await Certification.findByIdAndUpdate(
      id,
      { 
        isActive: false,
        revokedAt: new Date(),
        revocationReason: reason,
        revokedBy: req.user.id
      },
      { new: true }
    );
    
    if (!certification) {
      return errorResponse(res, 'Certification not found', 404);
    }
    
    successResponse(res, certification, 'Certification revoked successfully');
  } catch (error) {
    console.error('Error revoking certification:', error);
    errorResponse(res, 'Failed to revoke certification', 500);
  }
};

export {
  getUserCertifications,
  getCertificationById,
  verifyCertification,
  issueCertification,
  getCertificationsByLanguage,
  getCertificationStats,
  generateDigitalBadge,
  shareCertification,
  revokeCertification
};
