import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { 
  verifyFirebaseToken, 
  createCustomToken, 
  getFirebaseUser,
  setUserClaims,
  getFirebaseUserByEmail,
  linkFirebaseAccounts,
  getFirebaseUserProviders
} from '../config/firebase.js';
import User from '../models/User.js';
import Gamification from '../models/Gamification.js';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Register new user
export const register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      role, 
      grade, 
      school, 
      board, 
      parentId,
      firebaseUid 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Validate role-specific requirements - only for explicit student registration (not auto-registration)
    if (role === 'student') {
      // Skip validation for users who will complete onboarding later
      const skipValidation = req.body.needsOnboarding === true;
      
      if (!skipValidation && (!grade || !board)) {
        return res.status(400).json({
          success: false,
          message: 'Grade and board are required for students'
        });
      }
      
      if (grade && (grade < 6 || grade > 10)) {
        return res.status(400).json({
          success: false,
          message: 'Grade must be between 6 and 10'
        });
      }
    }

    // Get authentication provider
    const authProvider = req.body.authProvider || 'password';
    
    // Check if email is verified (from Firebase)
    let isEmailVerified = false;
    if (firebaseUid) {
      try {
        const firebaseUser = await getFirebaseUser(firebaseUid);
        isEmailVerified = firebaseUser.emailVerified || false;
      } catch (error) {
        console.warn('Failed to get Firebase user data:', error.message);
        // Continue without failing the registration
      }
    }
    
    // Create user data
    const userData = {
      firebaseUid,
      email,
      firstName,
      lastName,
      role,
      isEmailVerified,
      authProvider,
      lastLogin: new Date(),
      createdAt: new Date()
    };

    // Add role-specific data
    if (role === 'student') {
      userData.grade = grade;
      userData.school = school;
      userData.board = board;
      if (parentId) userData.parentId = parentId;
    }

    // Create user
    const user = await User.create(userData);

    // Try to set Firebase custom claims (optional, don't fail if it doesn't work)
    try {
      await setUserClaims(firebaseUid, {
        role: role,
        userId: user._id.toString()
      });
    } catch (claimsError) {
      console.warn('Failed to set Firebase custom claims:', claimsError.message);
      // Continue without failing the registration
    }

    // Create gamification profile for students
    if (role === 'student') {
      await Gamification.create({
        userId: user._id,
        totalPoints: 0,
        level: 1,
        experience: 0,
        currentStreak: 0
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Handle both Firebase token and email/password login
    const { firebaseToken, email, password } = req.body;

    let decodedToken, firebaseUid, authProvider, providerEmail;
    let user = null;

    // Firebase token login (Google, Facebook, etc.)
    if (firebaseToken) {
      try {
        // Log token length for debugging (safely without revealing content)
        console.log(`Received Firebase token of length: ${firebaseToken ? firebaseToken.length : 0}`);
        
        // Verify Firebase token
        decodedToken = await verifyFirebaseToken(firebaseToken);
        
        // Check for required fields in token
        if (!decodedToken || !decodedToken.uid) {
          throw new Error('Invalid token: missing required fields');
        }
        
        firebaseUid = decodedToken.uid;
        providerEmail = decodedToken.email;
        
        console.log(`Successfully verified token for user: ${firebaseUid}, email: ${providerEmail || 'not provided'}`);
        
        // Check Firebase auth provider
        if (decodedToken.firebase?.sign_in_provider) {
          if (decodedToken.firebase.sign_in_provider === 'google.com') {
            authProvider = 'google';
          } else if (decodedToken.firebase.sign_in_provider === 'facebook.com') {
            authProvider = 'facebook';
          } else if (decodedToken.firebase.sign_in_provider === 'password') {
            authProvider = 'password';
          } else {
            authProvider = decodedToken.firebase.sign_in_provider;
          }
          console.log(`Auth provider detected: ${authProvider}`);
        } else {
          console.warn('No auth provider information in token');
        }

        // First check by Firebase UID
        user = await User.findOne({ firebaseUid: firebaseUid });
        
        // Check if the account is linked to a primary account
        if (user && user.isLinkedTo) {
          // If this is a secondary account, redirect to primary account
          const primaryUser = await User.findOne({ firebaseUid: user.isLinkedTo });
          if (primaryUser) {
            console.log(`User ${user.email} is linked to ${primaryUser.email}, using primary account`);
            user = primaryUser;
          }
        }
        
        // If no user found by Firebase UID, check by email
        if (!user && providerEmail) {
          user = await User.findOne({ email: providerEmail });
          
          // If found by email but different auth provider, handle cross-provider authentication
          if (user) {
            // Check if the account is already linked
            const isAlreadyLinked = user.linkedAccounts && 
              user.linkedAccounts.some(account => account.firebaseUid === firebaseUid);
            
            if (!isAlreadyLinked) {
              // Add this as a linked account
              if (!user.linkedAccounts) {
                user.linkedAccounts = [];
              }
              
              user.linkedAccounts.push({
                firebaseUid: firebaseUid,
                provider: authProvider,
                email: providerEmail,
                linkedAt: new Date()
              });
              
              console.log(`Added ${authProvider} account as linked account for ${user.email}`);
            }
            
            // Update the auth provider if the user is logging in with a different method
            if (user.authProvider !== authProvider) {
              console.log(`Updated auth provider for ${user.email} from ${user.authProvider} to ${authProvider}`);
              user.lastAuthProvider = user.authProvider; // Track the previous provider
              user.authProvider = authProvider;
            }
            
            await user.save();
          }
        }
        
        // If still no user found and we have email information, create a new account
        if (!user && providerEmail && decodedToken.name) {
          // This is for social login auto-registration
          // Extract first and last name from the name (if available)
          let firstName = decodedToken.name;
          let lastName = '';
          
          if (decodedToken.name && decodedToken.name.includes(' ')) {
            const nameParts = decodedToken.name.split(' ');
            firstName = nameParts[0];
            lastName = nameParts.slice(1).join(' ');
          }
          
          try {
            // Create a new user with a generic role instead of student to avoid validation issues
            // Users can update their profile with specific details later
            user = await User.create({
              firebaseUid,
              email: providerEmail,
              firstName,
              lastName,
              role: 'user', // Generic role that doesn't require grade/board
              authProvider,
              isEmailVerified: true, // Usually verified with social logins
              lastLogin: new Date(),
              // Include default values for user onboarding
              grade: null, // Will be filled during profile completion
              board: 'Other', // Default value to pass validation
              subscriptionType: 'free' // Default subscription
            });
            
            console.log(`Auto-registered new user via ${authProvider}: ${providerEmail}`);
            
            // Create gamification profile for the new user
            await Gamification.create({
              userId: user._id,
              totalPoints: 0,
              level: 1,
              experience: 0,
              currentStreak: 0
            });
            
            // Try to set Firebase custom claims
            try {
              console.log(`Setting custom claims for user ${firebaseUid} with role: user`);
              await setUserClaims(firebaseUid, {
                role: 'user',
                userId: user._id.toString(),
                needsOnboarding: true // Flag that this user needs to complete onboarding
              });
              console.log('Successfully set custom claims for new user');
            } catch (claimsError) {
              // This is non-fatal, the user can still log in without custom claims
              console.warn('Failed to set Firebase custom claims:', {
                errorMessage: claimsError.message,
                userId: user._id.toString(),
                firebaseUid: firebaseUid,
                authProvider: authProvider
              });
              
              // Add analytics or monitoring event for tracking this issue
              if (claimsError.message.includes('insufficient-permission')) {
                console.error('PERMISSION ERROR: Firebase Admin SDK lacks permission to set custom claims');
              } else if (claimsError.message.includes('user-not-found')) {
                console.error('USER ERROR: Firebase user exists but cannot be accessed by Admin SDK');
              }
              
              // Add more diagnostic information to help troubleshoot
              if (claimsError.code === 'auth/insufficient-permission') {
                console.warn('The Firebase Admin SDK does not have sufficient permission. Check service account permissions.');
              } else if (claimsError.code === 'auth/invalid-claims') {
                console.warn('The custom claims provided were invalid (too large or malformed).');
              } else if (claimsError.code === 'auth/argument-error') {
                console.warn('Invalid argument provided to setCustomUserClaims.');
              }
            }
          } catch (registrationError) {
            console.error('Auto-registration error:', registrationError.message);
            throw new Error(`Failed to auto-register user: ${registrationError.message}`);
          }
        }
      } catch (error) {
        console.error('Firebase authentication error:', error.message);
        
        // Determine proper status code and message based on error
        let statusCode = 401;
        let errorMessage = 'Authentication failed';
        
        if (error.message.includes('Firebase not initialized')) {
          statusCode = 500;
          errorMessage = 'Authentication system is not properly configured';
        } else if (error.message.includes('token expired')) {
          errorMessage = 'Authentication session expired. Please sign in again';
        } else if (error.message.includes('revoked')) {
          errorMessage = 'Authentication token has been revoked. Please sign in again';
        } else if (error.message.includes('Malformed')) {
          errorMessage = 'Invalid authentication data provided';
        }
        
        return res.status(statusCode).json({
          success: false,
          message: errorMessage,
          code: 'FIREBASE_AUTH_ERROR',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    } 
    
    // If no user found and we're missing info to auto-register,
    // respond with a not found error
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          avatar: user.avatar,
          grade: user.grade,
          board: user.board,
          isEmailVerified: user.isEmailVerified,
          subscriptionType: user.subscriptionType,
          lastLogin: user.lastLogin,
          needsOnboarding: user.needsOnboarding || false
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // But we can log the logout event or invalidate refresh tokens
    
    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// Check if email exists and get provider
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Check if user exists in our database
    const user = await User.findOne({ email });
    
    // Check if this email is used in any linked accounts
    let linkedToUser = null;
    if (!user) {
      linkedToUser = await User.findOne({ 'linkedAccounts.email': email });
    }
    
    // Check if user exists in Firebase but not in our database
    let firebaseUser = null;
    let firebaseProviders = [];
    
    try {
      firebaseUser = await getFirebaseUserByEmail(email);
      if (firebaseUser) {
        // Get all provider data
        const providerData = firebaseUser.providerData || [];
        
        // Map all providers
        for (const provider of providerData) {
          if (provider.providerId === 'google.com') {
            firebaseProviders.push('google');
          } else if (provider.providerId === 'facebook.com') {
            firebaseProviders.push('facebook');
          } else if (provider.providerId === 'password') {
            firebaseProviders.push('password');
          } else {
            firebaseProviders.push(provider.providerId);
          }
        }
      }
    } catch (error) {
      console.warn(`Firebase user check failed for email ${email}:`, error.message);
      // Continue without failing
    }
    
    if (user) {
      // Get all available providers for this user
      const availableProviders = [user.authProvider];
      
      // Add linked account providers
      if (user.linkedAccounts && user.linkedAccounts.length > 0) {
        for (const linkedAccount of user.linkedAccounts) {
          if (!availableProviders.includes(linkedAccount.provider)) {
            availableProviders.push(linkedAccount.provider);
          }
        }
      }
      
      // Return user info with all available providers
      return res.status(200).json({
        success: true,
        exists: true,
        primaryProvider: user.authProvider || 'password',
        availableProviders: availableProviders,
        hasLinkedAccounts: user.linkedAccounts && user.linkedAccounts.length > 0
      });
    } else if (linkedToUser) {
      // This email is linked to another account
      return res.status(200).json({
        success: true,
        exists: true,
        primaryProvider: linkedToUser.authProvider || 'password',
        linkedToEmail: linkedToUser.email,
        isLinkedAccount: true,
        message: `This email is linked to account ${linkedToUser.email}`
      });
    } else if (firebaseUser && firebaseProviders.length > 0) {
      // User exists in Firebase but not in our database
      return res.status(200).json({
        success: true,
        exists: true,
        primaryProvider: firebaseProviders[0] || 'firebase',
        availableProviders: firebaseProviders,
        needsRegistration: true,
        firebaseUid: firebaseUser.uid
      });
    } else {
      // User does not exist anywhere
      return res.status(200).json({
        success: true,
        exists: false
      });
    }
  } catch (error) {
    console.error('Check email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during email check'
    });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token (this would be implemented based on your refresh token strategy)
    // For now, we'll use Firebase token refresh
    const decodedToken = await verifyFirebaseToken(refreshToken);
    
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new JWT token
    const newToken = generateToken(user._id);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Input validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Log the password reset attempt
    console.log(`Password reset requested for email: ${email}`);

    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if user exists or not for security
      // Still return success to prevent email enumeration
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Update last password reset request time for rate limiting
    await User.findOneAndUpdate(
      { email },
      { lastPasswordResetRequest: new Date() },
      { upsert: false }
    );

    // Since we're using Firebase Auth for password reset,
    // the actual email sending is handled by Firebase
    // This endpoint is mainly for logging and rate limiting
    
    res.json({
      success: true,
      message: 'Password reset instructions have been sent to your email address. Please check your inbox and follow the instructions.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request. Please try again later.'
    });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, password, email } = req.body;

    // Input validation
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required'
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Log the password reset completion attempt
    console.log(`Password reset completion attempted for token: ${token.substring(0, 10)}...`);

    // Since we're using Firebase Auth for password reset,
    // the actual password reset is handled by Firebase
    // This endpoint is mainly for logging and additional validation
    
    if (email) {
      // Update user's last password reset time
      await User.findOneAndUpdate(
        { email },
        { 
          lastPasswordReset: new Date(),
          lastPasswordResetRequest: null // Clear the request timestamp
        },
        { upsert: false }
      );
    }

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while resetting your password. Please try again or request a new reset link.'
    });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // In a real implementation, you would:
    // 1. Verify the email verification token
    // 2. Mark user as email verified
    // 3. Invalidate the verification token

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Resend verification email
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // In a real implementation, you would:
    // 1. Generate a new verification token
    // 2. Send verification email

    res.json({
      success: true,
      message: 'Verification email sent'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Complete user onboarding
export const completeOnboarding = async (req, res) => {
  try {
    const userId = req.user.id; // Get authenticated user ID from middleware
    const { 
      role, 
      grade, 
      board, 
      school,
      preferredLanguages,
      parentId
    } = req.body;
    
    // Validate input based on role
    if (role === 'student') {
      if (!grade || !board) {
        return res.status(400).json({
          success: false,
          message: 'Grade and board are required for students'
        });
      }
      
      if (grade < 6 || grade > 10) {
        return res.status(400).json({
          success: false,
          message: 'Grade must be between 6 and 10'
        });
      }
    }
    
    // Get the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user information
    user.role = role;
    user.needsOnboarding = false;
    
    // Update role-specific fields
    if (role === 'student') {
      user.grade = grade;
      user.board = board;
      if (school) user.school = school;
      if (parentId) user.parentId = parentId;
    }
    
    // Update optional fields if provided
    if (preferredLanguages && Array.isArray(preferredLanguages)) {
      user.preferredLanguages = preferredLanguages;
    }
    
    // Save the user
    await user.save();
    
    // Update Firebase custom claims with new role
    try {
      console.log(`Updating claims for user ${user.firebaseUid} after onboarding completion. New role: ${role}`);
      await setUserClaims(user.firebaseUid, {
        role: role,
        userId: user._id.toString(),
        needsOnboarding: false
      });
      console.log('Successfully updated Firebase custom claims during onboarding completion');
    } catch (claimsError) {
      console.warn('Failed to update Firebase custom claims during onboarding:', {
        errorMessage: claimsError.message,
        userId: user._id.toString(),
        firebaseUid: user.firebaseUid
      });
      
      // Track specific error types for monitoring
      if (claimsError.message.includes('insufficient-permission')) {
        console.error('PERMISSION ERROR: Firebase Admin SDK lacks permission to set custom claims during onboarding');
      } else if (claimsError.message.includes('user-not-found')) {
        console.error('USER ERROR: Firebase user exists but cannot be accessed by Admin SDK during onboarding');
      }
      
      // Continue without failing - the app will still function without custom claims
      // The role is stored in the database and will be used for authorization
    }
    
    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          avatar: user.avatar,
          grade: user.grade,
          board: user.board,
          isEmailVerified: user.isEmailVerified,
          needsOnboarding: false
        }
      }
    });
    
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during onboarding completion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Link accounts (when a user has multiple authentication methods)
export const linkAccounts = async (req, res) => {
  try {
    const { primaryUid, secondaryUid, provider } = req.body;
    
    if (!primaryUid || !secondaryUid) {
      return res.status(400).json({
        success: false,
        message: 'Both primary and secondary user IDs are required'
      });
    }
    
    // Find both user accounts
    const primaryUser = await User.findOne({ firebaseUid: primaryUid });
    const secondaryUser = await User.findOne({ firebaseUid: secondaryUid });
    
    if (!primaryUser) {
      return res.status(404).json({
        success: false,
        message: 'Primary user account not found'
      });
    }
    
    if (!secondaryUser) {
      return res.status(404).json({
        success: false,
        message: 'Secondary user account not found'
      });
    }
    
    // Try to link accounts in Firebase (will mostly be informational for now)
    try {
      await linkFirebaseAccounts(primaryUid, secondaryUid);
    } catch (firebaseError) {
      console.warn('Firebase account linking failed (continuing):', firebaseError.message);
      // Continue with our own linking process
    }
    
    // Update the auth provider in the primary account if specified
    if (provider) {
      primaryUser.authProvider = provider;
    }
    
    // Check if the account is already linked to prevent duplicates
    if (!primaryUser.linkedAccounts) {
      primaryUser.linkedAccounts = [];
    }
    
    const alreadyLinked = primaryUser.linkedAccounts.some(
      account => account.firebaseUid === secondaryUser.firebaseUid
    );
    
    if (!alreadyLinked) {
      // Get the provider from the secondary account or use the provided one
      const accountProvider = provider || secondaryUser.authProvider || 
        (await getFirebaseUserProviders(secondaryUid))[0] || 'unknown';
      
      // Store the linked account information
      primaryUser.linkedAccounts.push({
        firebaseUid: secondaryUser.firebaseUid,
        provider: accountProvider,
        email: secondaryUser.email,
        linkedAt: new Date()
      });
    }
    
    await primaryUser.save();
    
    // Now the secondary account could be marked for deletion or kept for reference
    // But we'll keep it intact for now with a flag
    secondaryUser.isLinkedTo = primaryUser.firebaseUid;
    await secondaryUser.save();
    
    res.json({
      success: true,
      message: 'Accounts linked successfully',
      data: {
        primaryAccount: {
          id: primaryUser._id,
          email: primaryUser.email,
          provider: primaryUser.authProvider
        },
        secondaryAccount: {
          id: secondaryUser._id,
          email: secondaryUser.email,
          provider: secondaryUser.authProvider
        },
        linkedAccounts: primaryUser.linkedAccounts
      }
    });
    
  } catch (error) {
    console.error('Link accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during account linking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
