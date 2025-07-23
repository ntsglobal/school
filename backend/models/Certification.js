import mongoose from 'mongoose';

const certificationSchema = new mongoose.Schema({
  // Certificate Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Certificate Type and Level
  type: {
    type: String,
    required: true,
    enum: ['course_completion', 'level_completion', 'cefr_certification', 'skill_badge', 'achievement_badge']
  },
  category: {
    type: String,
    enum: ['language_proficiency', 'course_mastery', 'skill_achievement', 'cultural_knowledge', 'community_contribution']
  },
  
  // Language and Level
  language: {
    code: {
      type: String,
      required: true
    },
    name: String,
    nativeName: String
  },
  cefrLevel: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  },
  
  // Academic Context
  gradeLevel: {
    type: Number,
    min: 6,
    max: 12
  },
  board: {
    type: String,
    enum: ['CBSE', 'ICSE', 'International', 'All']
  },
  
  // Requirements
  requirements: {
    // Course Requirements
    courses: [{
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      },
      completionRequired: {
        type: Boolean,
        default: true
      },
      minimumScore: {
        type: Number,
        default: 70
      }
    }],
    
    // Assessment Requirements
    assessments: [{
      assessment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment'
      },
      minimumScore: {
        type: Number,
        required: true
      },
      attempts: {
        type: Number,
        default: 1
      }
    }],
    
    // Skill Requirements
    skills: [{
      skill: {
        type: String,
        enum: ['listening', 'reading', 'speaking', 'writing', 'vocabulary', 'grammar', 'pronunciation']
      },
      minimumLevel: {
        type: Number,
        min: 1,
        max: 100
      },
      assessmentMethod: String
    }],
    
    // Activity Requirements
    activities: {
      totalLessons: Number,
      totalHours: Number,
      streakDays: Number,
      liveClassesAttended: Number,
      communityParticipation: Number,
      culturalContentCompleted: Number
    },
    
    // Time Requirements
    minStudyTime: Number, // in hours
    minCourseDuration: Number, // in days
    validityPeriod: Number // in days
  },
  
  // Certificate Design
  design: {
    template: {
      type: String,
      required: true
    },
    layout: {
      type: String,
      enum: ['standard', 'premium', 'modern', 'classical'],
      default: 'standard'
    },
    colors: {
      primary: String,
      secondary: String,
      accent: String
    },
    logo: String,
    backgroundImage: String,
    fonts: {
      title: String,
      content: String,
      signature: String
    }
  },
  
  // Certificate Content
  content: {
    header: String,
    bodyText: String,
    footerText: String,
    signatureLines: [{
      name: String,
      title: String,
      organization: String,
      signature: String
    }],
    additionalInfo: [String],
    disclaimers: [String]
  },
  
  // Verification
  verification: {
    method: {
      type: String,
      enum: ['qr_code', 'blockchain', 'database', 'digital_signature'],
      default: 'qr_code'
    },
    verificationUrl: String,
    blockchainHash: String,
    digitalSignature: String,
    verificationCode: String
  },
  
  // External Standards
  externalStandards: [{
    organization: String,
    standard: String,
    level: String,
    equivalency: String,
    recognitionBody: String
  }],
  
  // Skills and Competencies
  skillsAssessed: [{
    skill: String,
    level: String,
    description: String,
    evidence: [String]
  }],
  competencies: [{
    competency: String,
    level: String,
    description: String,
    measuredBy: String
  }],
  
  // Certificate Metadata
  issuer: {
    organization: {
      type: String,
      required: true
    },
    name: String,
    title: String,
    email: String,
    website: String,
    logo: String,
    accreditation: [String]
  },
  
  // Digital Properties
  digitalBadge: {
    isDigitalBadge: {
      type: Boolean,
      default: true
    },
    badgeClass: String,
    issuerProfile: String,
    criteria: String,
    evidence: [String],
    alignment: [String],
    tags: [String]
  },
  
  // Shareability
  sharing: {
    allowLinkedIn: {
      type: Boolean,
      default: true
    },
    allowSocialMedia: {
      type: Boolean,
      default: true
    },
    allowResume: {
      type: Boolean,
      default: true
    },
    publicProfile: {
      type: Boolean,
      default: false
    },
    shareableUrl: String
  },
  
  // Analytics
  analytics: {
    totalIssued: {
      type: Number,
      default: 0
    },
    totalShared: {
      type: Number,
      default: 0
    },
    verificationAttempts: {
      type: Number,
      default: 0
    },
    averageTimeToComplete: Number, // in days
    completionRate: {
      type: Number,
      default: 0
    }
  },
  
  // Status and Lifecycle
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'deprecated'],
    default: 'draft'
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: Date,
  
  // Quality and Recognition
  qualityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  recognition: [{
    organization: String,
    recognitionDate: Date,
    scope: String,
    notes: String
  }],
  
  // Compliance
  compliance: {
    gdprCompliant: {
      type: Boolean,
      default: true
    },
    dataRetentionPeriod: Number, // in years
    privacyPolicy: String,
    termsOfUse: String
  }
}, {
  timestamps: true
});

// Certificate Instance Schema (individual certificates issued to users)
const certificateInstanceSchema = new mongoose.Schema({
  // Basic Information
  certificateTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certification',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Certificate Details
  certificateNumber: {
    type: String,
    required: true,
    unique: true
  },
  title: String,
  description: String,
  
  // Achievement Data
  achievement: {
    completedCourses: [{
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      },
      completedAt: Date,
      finalScore: Number,
      grade: String
    }],
    assessmentResults: [{
      assessment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment'
      },
      score: Number,
      maxScore: Number,
      percentage: Number,
      completedAt: Date,
      attempts: Number
    }],
    skillLevels: [{
      skill: String,
      level: Number,
      assessedAt: Date,
      evidence: [String]
    }],
    studyStatistics: {
      totalHours: Number,
      totalLessons: Number,
      streakDays: Number,
      averageScore: Number,
      startDate: Date,
      completionDate: Date
    }
  },
  
  // Issuance Information
  issuedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  issuedBy: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    title: String,
    organization: String
  },
  
  // Verification
  verification: {
    verificationCode: {
      type: String,
      required: true,
      unique: true
    },
    qrCode: String,
    verificationUrl: String,
    blockchainHash: String,
    digitalSignature: String,
    verifiedAt: Date,
    verificationCount: {
      type: Number,
      default: 0
    }
  },
  
  // Digital File
  digitalFile: {
    pdfUrl: String,
    imageUrl: String,
    jsonData: String,
    fileSize: Number,
    generatedAt: Date
  },
  
  // Validity
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: Date,
  isValid: {
    type: Boolean,
    default: true
  },
  
  // Sharing and Privacy
  sharing: {
    shared: [{
      platform: String,
      sharedAt: Date,
      url: String
    }],
    publiclyVisible: {
      type: Boolean,
      default: false
    },
    shareableUrl: String,
    linkedInAdded: {
      type: Boolean,
      default: false
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['issued', 'verified', 'revoked', 'expired'],
    default: 'issued'
  },
  
  // Revocation
  revocation: {
    isRevoked: {
      type: Boolean,
      default: false
    },
    revokedAt: Date,
    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    notified: {
      type: Boolean,
      default: false
    }
  },
  
  // Analytics
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    verifications: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    lastAccessed: Date
  }
}, {
  timestamps: true
});

// Indexes
certificationSchema.index({ 'language.code': 1, cefrLevel: 1 });
certificationSchema.index({ type: 1, category: 1 });
certificationSchema.index({ status: 1, validFrom: 1 });
certificationSchema.index({ gradeLevel: 1, board: 1 });

certificateInstanceSchema.index({ recipient: 1, issuedAt: -1 });
certificateInstanceSchema.index({ status: 1, validUntil: 1 });

// Pre-save middleware to generate certificate number
certificateInstanceSchema.pre('save', function(next) {
  if (this.isNew && !this.certificateNumber) {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    this.certificateNumber = `NTS-${year}-${random}`;
  }
  next();
});

// Pre-save middleware to generate verification code
certificateInstanceSchema.pre('save', function(next) {
  if (this.isNew && !this.verification.verificationCode) {
    this.verification.verificationCode = Math.random().toString(36).substr(2, 15).toUpperCase();
    this.verification.verificationUrl = `${process.env.FRONTEND_URL}/verify/${this.verification.verificationCode}`;
  }
  next();
});

// Virtual for certificate URL
certificateInstanceSchema.virtual('certificateUrl').get(function() {
  return `${process.env.FRONTEND_URL}/certificates/${this.certificateNumber}`;
});

// Methods
certificationSchema.methods.checkEligibility = function(userProgress) {
  // Complex eligibility checking logic would go here
  // This is a simplified version
  
  const requirements = this.requirements;
  let eligible = true;
  const missingRequirements = [];
  
  // Check course requirements
  if (requirements.courses && requirements.courses.length > 0) {
    for (const courseReq of requirements.courses) {
      const userCourse = userProgress.courses.find(c => 
        c.course.equals(courseReq.course)
      );
      
      if (!userCourse || !userCourse.completed || 
          userCourse.finalScore < courseReq.minimumScore) {
        eligible = false;
        missingRequirements.push(`Course completion with minimum score ${courseReq.minimumScore}%`);
      }
    }
  }
  
  // Check assessment requirements
  if (requirements.assessments && requirements.assessments.length > 0) {
    for (const assessmentReq of requirements.assessments) {
      const userAssessment = userProgress.assessments.find(a => 
        a.assessment.equals(assessmentReq.assessment)
      );
      
      if (!userAssessment || userAssessment.bestScore < assessmentReq.minimumScore) {
        eligible = false;
        missingRequirements.push(`Assessment score of ${assessmentReq.minimumScore}% or higher`);
      }
    }
  }
  
  return { eligible, missingRequirements };
};

certificationSchema.methods.generateCertificate = async function(userId, achievementData) {
  const certificateInstance = new CertificateInstance({
    certificateTemplate: this._id,
    recipient: userId,
    title: this.title,
    description: this.description,
    achievement: achievementData,
    issuedBy: {
      name: this.issuer.name,
      title: this.issuer.title,
      organization: this.issuer.organization
    },
    validUntil: this.validUntil
  });
  
  await certificateInstance.save();
  
  // Update analytics
  this.analytics.totalIssued += 1;
  await this.save();
  
  return certificateInstance;
};

certificateInstanceSchema.methods.verify = function() {
  this.verification.verificationCount += 1;
  this.verification.verifiedAt = new Date();
  this.analytics.verifications += 1;
  return this.save();
};

certificateInstanceSchema.methods.revoke = function(revokedBy, reason) {
  this.revocation.isRevoked = true;
  this.revocation.revokedAt = new Date();
  this.revocation.revokedBy = revokedBy;
  this.revocation.reason = reason;
  this.status = 'revoked';
  this.isValid = false;
  return this.save();
};

certificateInstanceSchema.methods.addShare = function(platform, url) {
  this.sharing.shared.push({
    platform,
    sharedAt: new Date(),
    url
  });
  this.analytics.shares += 1;
  return this.save();
};

// Static methods
certificationSchema.statics.getByLanguageAndLevel = function(language, cefrLevel) {
  return this.find({
    'language.code': language,
    cefrLevel: cefrLevel,
    status: 'active'
  }).sort({ qualityScore: -1 });
};

certificationSchema.statics.getAvailableForUser = function(userProfile) {
  return this.find({
    'language.code': userProfile.learningLanguage,
    cefrLevel: { $lte: userProfile.currentLevel },
    gradeLevel: { $lte: userProfile.gradeLevel + 1, $gte: userProfile.gradeLevel - 1 },
    status: 'active'
  });
};

certificateInstanceSchema.statics.getUserCertificates = function(userId) {
  return this.find({ recipient: userId, status: { $ne: 'revoked' } })
    .populate('certificateTemplate')
    .sort({ issuedAt: -1 });
};

certificateInstanceSchema.statics.verifyByCode = function(verificationCode) {
  return this.findOne({
    'verification.verificationCode': verificationCode,
    status: { $ne: 'revoked' },
    isValid: true
  }).populate('certificateTemplate recipient', 'title name email');
};

export const Certification = mongoose.model('Certification', certificationSchema);
export const CertificateInstance = mongoose.model('CertificateInstance', certificateInstanceSchema);

export default { Certification, CertificateInstance };
