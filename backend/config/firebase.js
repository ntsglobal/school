import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const initializeFirebase = async () => {
  try {
    if (!admin.apps.length) {
      // Check if Firebase credentials are provided
      if (!process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID === 'your-firebase-project-id') {
        console.log('⚠️ Firebase credentials not configured. Skipping Firebase initialization.');
        return;
      }
      
      // Log environment variables (without sensitive values)
      console.log('Firebase configuration check:');
      console.log(`- Project ID: ${process.env.FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Not set'}`);
      console.log(`- Private Key ID: ${process.env.FIREBASE_PRIVATE_KEY_ID ? '✓ Set' : '✗ Not set'}`);
      console.log(`- Private Key: ${process.env.FIREBASE_PRIVATE_KEY ? '✓ Set' : '✗ Not set'}`);
      console.log(`- Client Email: ${process.env.FIREBASE_CLIENT_EMAIL ? '✓ Set' : '✗ Not set'}`);
      console.log(`- Client ID: ${process.env.FIREBASE_CLIENT_ID ? '✓ Set' : '✗ Not set'}`);
      
      // Check for problematic private key format
      if (process.env.FIREBASE_PRIVATE_KEY && !process.env.FIREBASE_PRIVATE_KEY.includes('-----BEGIN PRIVATE KEY-----')) {
        console.warn('⚠️ Firebase private key does not appear to be in the correct format.');
        console.warn('Private key should include certificate headers and be properly formatted with newlines.');
      }
      
      // Create service account object
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
        token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
      };

      // Attempt initialization
      console.log('Initializing Firebase Admin SDK...');
      try {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
        console.log('🔥 Firebase Admin SDK initialized successfully');
      } catch (initError) {
        console.error('Firebase initialization error:', initError);
        throw initError; // Re-throw to be caught by outer try-catch
      }

      // Verify initialization by testing authentication service
      try {
        const auth = admin.auth();
        if (!auth) {
          throw new Error('Auth service not available after initialization');
        }
        
        console.log('Testing Firebase Admin permissions...');
        
        // Test admin SDK with different permission levels
        try {
          // First try basic user management (most common permission)
          await auth.listUsers(1);
          console.log('✓ Firebase Admin SDK connection verified with user management permissions');
        } catch (userError) {
          try {
            // If user management fails, try tenant management (less common)
            if (auth.tenantManager && typeof auth.tenantManager().list === 'function') {
              await auth.tenantManager().list({ maxResults: 1 });
              console.log('✓ Firebase Admin SDK connection verified with tenant access');
            } else {
              throw new Error('Tenant manager not available');
            }
          } catch (tenantError) {
            console.warn(`⚠️ Firebase permission tests failed:`);
            console.warn(`   User management: ${userError.message}`);
            console.warn(`   Tenant management: ${tenantError.message}`);
            console.warn('👉 Authentication features may be limited due to permission issues');
            // Continue with limited functionality
          }
        }
      } catch (authError) {
        console.error('Firebase auth service test error:', authError);
        console.warn('👉 Authentication features may be limited due to permission issues');
        // Don't throw, continue with limited functionality
      }
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.error('Details:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.errorInfo) {
      console.error('Firebase error info:', error.errorInfo);
    }
    console.log('⚠️ Continuing without Firebase. Authentication features will not work correctly.');
  }
};

// Verify Firebase ID token
export const verifyFirebaseToken = async (idToken) => {
  try {
    // Check if Firebase is initialized
    if (!admin.apps.length) {
      throw new Error('Firebase not initialized');
    }
    
    // Validate that the token is not empty or malformed
    if (!idToken || typeof idToken !== 'string' || idToken.trim() === '') {
      throw new Error('Empty or invalid token format');
    }
    
    // Attempt to verify the token
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (verifyError) {
      // Log specific Firebase error for debugging
      console.error('Firebase token verification failed:', verifyError.code, verifyError.message);
      
      // Provide more specific error based on Firebase error code
      if (verifyError.code === 'auth/argument-error') {
        throw new Error('Malformed Firebase token');
      } else if (verifyError.code === 'auth/id-token-expired') {
        throw new Error('Firebase token expired');
      } else if (verifyError.code === 'auth/id-token-revoked') {
        throw new Error('Firebase token has been revoked');
      } else {
        throw new Error(`Invalid Firebase token: ${verifyError.message}`);
      }
    }
  } catch (error) {
    // Wrap all errors for consistent handling
    console.error('Token verification error:', error.message);
    throw new Error(`Firebase token verification failed: ${error.message}`);
  }
};

// Create custom token
export const createCustomToken = async (uid, additionalClaims = {}) => {
  try {
    const customToken = await admin.auth().createCustomToken(uid, additionalClaims);
    return customToken;
  } catch (error) {
    throw new Error('Failed to create custom token');
  }
};

// Get user by UID
export const getFirebaseUser = async (uid) => {
  try {
    const userRecord = await admin.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    throw new Error('User not found');
  }
};

// Update user claims
export const setUserClaims = async (uid, customClaims) => {
  try {
    // Check Firebase initialization
    if (!admin.apps.length) {
      throw new Error('Firebase not initialized');
    }
    
    // Check if uid is valid
    if (!uid || typeof uid !== 'string' || uid.trim() === '') {
      throw new Error('Invalid or empty user ID');
    }
    
    // Check if customClaims is an object
    if (!customClaims || typeof customClaims !== 'object') {
      throw new Error('Custom claims must be an object');
    }
    
    // Log the claims setting attempt for debugging
    console.log(`Attempting to set custom claims for uid: ${uid}`, JSON.stringify(customClaims));
    
    // Set the custom claims
    await admin.auth().setCustomUserClaims(uid, customClaims);
    return true;
  } catch (error) {
    // Log detailed error information
    console.error('Failed to set Firebase custom claims:', {
      errorCode: error.code,
      errorMessage: error.message,
      uid: uid,
      claims: JSON.stringify(customClaims)
    });
    
    // Provide more specific error messages based on common Firebase error codes
    if (error.code === 'auth/invalid-uid') {
      throw new Error('Invalid Firebase user ID format');
    } else if (error.code === 'auth/user-not-found') {
      throw new Error('Firebase user not found');
    } else if (error.code === 'auth/insufficient-permission') {
      throw new Error('Insufficient permissions to set custom claims. Check Firebase Admin credentials');
    } else {
      throw new Error(`Failed to set user claims: ${error.message}`);
    }
  }
};

// Get user by email
export const getFirebaseUserByEmail = async (email) => {
  try {
    if (!admin.apps.length) {
      throw new Error('Firebase not initialized');
    }
    const userRecord = await admin.auth().getUserByEmail(email);
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw new Error(`Firebase user lookup failed: ${error.message}`);
  }
};

// Link two Firebase accounts
export const linkFirebaseAccounts = async (primaryUid, secondaryUid) => {
  try {
    if (!admin.apps.length) {
      throw new Error('Firebase not initialized');
    }
    
    // Get both user records
    const primaryUser = await admin.auth().getUser(primaryUid);
    const secondaryUser = await admin.auth().getUser(secondaryUid);
    
    // This requires custom Firebase Admin SDK usage
    // For now, we'll track the relationship in our database
    // and handle authentication accordingly
    
    console.log(`Firebase account linking requested between ${primaryUser.email} and ${secondaryUser.email}`);
    
    // Return both user records for reference
    return {
      primaryUser,
      secondaryUser
    };
  } catch (error) {
    throw new Error(`Firebase account linking failed: ${error.message}`);
  }
};

// Get all authentication providers for a user
export const getFirebaseUserProviders = async (uid) => {
  try {
    if (!admin.apps.length) {
      throw new Error('Firebase not initialized');
    }
    
    const userRecord = await admin.auth().getUser(uid);
    
    // Extract all providers
    const providers = [];
    if (userRecord.providerData) {
      for (const providerData of userRecord.providerData) {
        if (providerData.providerId === 'google.com') {
          providers.push('google');
        } else if (providerData.providerId === 'facebook.com') {
          providers.push('facebook');
        } else if (providerData.providerId === 'password') {
          providers.push('password');
        } else {
          providers.push(providerData.providerId);
        }
      }
    }
    
    return providers;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return [];
    }
    throw new Error(`Firebase provider lookup failed: ${error.message}`);
  }
};

// Export the initialization function so it can be called manually
export { initializeFirebase };

export default admin;
