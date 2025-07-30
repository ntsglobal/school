import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase.js';

class FirebaseAuthService {
  constructor() {
    this.auth = auth;
    this.googleProvider = new GoogleAuthProvider();
    this.facebookProvider = new FacebookAuthProvider();
    
    // Configure Facebook provider
    this.facebookProvider.addScope('email');
    this.facebookProvider.addScope('public_profile');
  }

  // Register new user with email and password
  async registerWithEmail(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Update the user's display name
      if (displayName) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
      }
      
      return userCredential.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Sign in with email and password
  async signInWithEmail(email, password) {
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Attempt authentication
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      
      // Validate result
      if (!userCredential || !userCredential.user) {
        throw new Error('Authentication succeeded but no user returned');
      }
      
      // Ensure we have a valid token by forcing a refresh
      try {
        await userCredential.user.getIdToken(true);
        console.log('Firebase token refreshed successfully');
      } catch (tokenError) {
        console.error('Failed to refresh token:', tokenError);
        // Continue despite token refresh error
      }
      
      return userCredential.user;
    } catch (error) {
      console.error('Firebase signInWithEmail error:', error.code, error.message);
      throw this.handleAuthError(error);
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(this.auth, this.googleProvider);
      return result.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Sign in with Facebook
  async signInWithFacebook() {
    try {
      const result = await signInWithPopup(this.auth, this.facebookProvider);
      return result.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(this.auth);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Get current user
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // Get Firebase ID token
  async getIdToken() {
    const user = this.getCurrentUser();
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(this.auth, callback);
  }

  // Link account with a provider
  async linkAccountWithProvider(providerName) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
      
      let provider;
      switch(providerName) {
        case 'google':
          provider = this.googleProvider;
          break;
        case 'facebook':
          provider = this.facebookProvider;
          break;
        default:
          throw new Error(`Unsupported provider: ${providerName}`);
      }
      
      const result = await signInWithPopup(this.auth, provider);
      return result.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  // Handle Firebase auth errors
  handleAuthError(error) {
    switch (error.code) {
      case 'auth/user-disabled':
        return new Error('This account has been disabled.');
      case 'auth/user-not-found':
        return new Error('No account found with this email.');
      case 'auth/wrong-password':
        return new Error('Incorrect password.');
      case 'auth/email-already-in-use':
        return new Error('An account with this email already exists.');
      case 'auth/weak-password':
        return new Error('Password should be at least 6 characters.');
      case 'auth/invalid-email':
        return new Error('Invalid email address.');
      case 'auth/operation-not-allowed':
        return new Error('This sign-in method is not enabled.');
      case 'auth/too-many-requests':
        return new Error('Too many failed attempts. Please try again later.');
      case 'auth/account-exists-with-different-credential':
        return new Error('An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.');
      case 'auth/credential-already-in-use':
        return new Error('This credential is already associated with a different user account.');
      case 'auth/requires-recent-login':
        return new Error('This operation requires re-authentication. Please log in again before retrying.');
      default:
        return new Error(error.message || 'An authentication error occurred.');
    }
  }
}

export default new FirebaseAuthService();
