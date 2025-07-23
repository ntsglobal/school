import NodeCache from 'node-cache';
import { verifyFirebaseToken as originalVerifyFirebaseToken } from '../config/firebase.js';

// Token cache with 5-minute TTL to reduce Firebase Admin SDK calls
const tokenCache = new NodeCache({ 
  stdTTL: 300, // 5 minutes
  checkperiod: 60, // Check for expired tokens every minute
  useClones: false
});

// User cache for frequently accessed user data
const userCache = new NodeCache({ 
  stdTTL: 600, // 10 minutes
  checkperiod: 120,
  useClones: false
});

// Cache Firebase token verification results
export const verifyFirebaseTokenCached = async (token) => {
  // Generate cache key from token (first 16 chars for security)
  const cacheKey = `token_${token.substring(0, 16)}`;
  
  // Check cache first
  const cachedResult = tokenCache.get(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }
  
  try {
    // Verify with Firebase if not in cache
    const decodedToken = await originalVerifyFirebaseToken(token);
    
    // Cache the result
    tokenCache.set(cacheKey, decodedToken);
    
    return decodedToken;
  } catch (error) {
    // Don't cache failed verifications
    throw error;
  }
};

// Cache user data to reduce database queries
export const cacheUserData = (userId, userData) => {
  userCache.set(`user_${userId}`, userData);
};

export const getCachedUserData = (userId) => {
  return userCache.get(`user_${userId}`);
};

export const invalidateUserCache = (userId) => {
  userCache.del(`user_${userId}`);
};

// Cache Firebase UID to MongoDB User ID mapping
const uidCache = new NodeCache({ 
  stdTTL: 1800, // 30 minutes
  checkperiod: 300
});

export const cacheUidMapping = (firebaseUid, userId) => {
  uidCache.set(`uid_${firebaseUid}`, userId);
};

export const getCachedUidMapping = (firebaseUid) => {
  return uidCache.get(`uid_${firebaseUid}`);
};

// Clear all caches
export const clearAllCaches = () => {
  tokenCache.flushAll();
  userCache.flushAll();
  uidCache.flushAll();
};

// Get cache statistics
export const getCacheStats = () => {
  return {
    tokenCache: tokenCache.getStats(),
    userCache: userCache.getStats(),
    uidCache: uidCache.getStats()
  };
};
