# Production Deployment Guide - NTS Language Learning Platform

## 🚀 Pre-Deployment Checklist

### 1. Environment Security
- [ ] Generate strong JWT secrets (minimum 256 bits)
- [ ] Configure Firebase service account properly
- [ ] Set up environment variables securely
- [ ] Enable HTTPS in production
- [ ] Configure CORS for production domain
- [ ] Set up rate limiting
- [ ] **Configure buddy system security settings**
- [ ] **Set up real-time notification security** 

### 2. Database Security
- [ ] Enable MongoDB authentication
- [ ] Configure MongoDB Atlas with IP whitelist
- [ ] Set up database backup strategy
- [ ] Enable audit logging
- [ ] Configure connection limits
- [ ] **Optimize buddy system indexes** 
- [ ] **Configure buddy connection rate limits** 

### 3. Firebase Configuration
- [ ] Verify Firebase project settings
- [ ] Configure authorized domains
- [ ] Set up Firebase security rules
- [ ] Enable audit logs
- [ ] Configure quotas and billing alerts
- [ ] **Test Firebase token caching optimization** 

### 4. Language Buddy System 
- [ ] Configure buddy matching algorithm parameters
- [ ] Set up notification delivery systems
- [ ] Configure buddy connection limits per user
- [ ] Test real-time notification performance
- [ ] Verify buddy profile data validation
- [ ] Set up buddy activity monitoring

## 🔧 Required Dependencies

### Backend Dependencies
```bash
# Core security and performance
npm install express-rate-limit rate-limit-mongo helmet node-cache

# Additional dependencies for buddy system
npm install mongoose-paginate-v2 express-validator sanitize-html

# Socket.io for real-time features (if not already installed)
npm install socket.io
```

### Frontend Dependencies
```bash
# Core API communication
npm install axios

# UI components for buddy system
npm install react-icons

# Additional utilities
npm install date-fns lodash
```

### Development Dependencies
```bash
# Testing for buddy system
npm install --save-dev jest supertest

# Environment management
npm install --save-dev dotenv-cli
```

## 📁 File Structure Updates

### 1. Verify Core Components
Ensure these files are present and properly configured:

**Backend Files:**
```bash
# Core buddy system files
backend/models/Buddy.js
backend/models/BuddyConnection.js
backend/controllers/buddyController.js
backend/routes/buddies.js

# Enhanced middleware
backend/middleware/auth.js
backend/middleware/rateLimiter.js
backend/middleware/security.js
backend/middleware/validation.js
```

**Frontend Files:**
```bash
# Buddy system components
frontend/src/components/LanguageBuddyFinder.jsx
frontend/src/components/BuddyProfileSetup.jsx
frontend/src/components/BuddyConnections.jsx
frontend/src/components/BuddyNotifications.jsx
frontend/src/pages/LanguageBuddyPage.jsx
frontend/src/services/buddyService.js

# Enhanced services
frontend/src/services/authService.js
frontend/src/services/api.js
```

### 2. Replace Enhanced Services (if using older versions)
Replace with enhanced versions if they exist:
```bash
# Only if enhanced versions exist
mv frontend/src/services/authService.enhanced.js frontend/src/services/authService.js
mv frontend/src/services/api.enhanced.js frontend/src/services/api.js
```

### 3. Verify Routes Configuration
Ensure buddy routes are properly integrated in:
```bash
# Check these files include buddy system routes
backend/server.js
frontend/src/App.jsx
frontend/src/components/Navbar.jsx
```

## 🛡️ Security Configuration

### 1. Backend Security Setup

Add to your main server file (`server.js`):

```javascript
import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';
import { apiSecurity } from './middleware/security.js';
import { sanitizeInput } from './middleware/validation.js';

// Apply security middleware
app.use(apiSecurity);
app.use(sanitizeInput);
app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);
```

### 2. Update Auth Routes

Add validation to your auth routes and include buddy system protection:

```javascript
import { 
  validateRegistration, 
  validateLogin, 
  handleValidationErrors 
} from '../middleware/validation.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';

// Apply to registration route
router.post('/register', 
  authLimiter,
  validateRegistration, 
  handleValidationErrors, 
  register
);

// Apply to login route
router.post('/login', 
  authLimiter,
  validateLogin, 
  handleValidationErrors, 
  login
);

// Apply to password reset
router.post('/forgot-password', 
  passwordResetLimiter,
  validatePasswordReset, 
  handleValidationErrors, 
  forgotPassword
);
```

### 3. Buddy System Security

Add buddy-specific security middleware:

```javascript
// Add to buddies.js routes
import { verifyFirebaseAuth } from '../middleware/auth.js';
import { buddyLimiter, connectionLimiter } from '../middleware/rateLimiter.js';
import { validateBuddyProfile, validateConnection } from '../middleware/validation.js';

// Protect buddy routes
router.use(verifyFirebaseAuth);

// Rate limit buddy operations
router.post('/profile', buddyLimiter, validateBuddyProfile, handleValidationErrors, createBuddyProfile);
router.post('/connect', connectionLimiter, validateConnection, handleValidationErrors, sendBuddyRequest);

// Limit buddy searches to prevent abuse
router.get('/find', searchLimiter, findBuddies);
```

## 🔑 Environment Variables Configuration

### 1. Backend Environment Variables

Create `.env.production`:

```bash
# Generate strong secrets
NODE_ENV=production
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nts-prod

# Firebase - Get from Firebase Console
FIREBASE_PROJECT_ID=ntsschool-ab557
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@ntsschool-ab557.iam.gserviceaccount.com

# Security
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5

# Buddy System Configuration 
BUDDY_SEARCH_LIMIT=20
BUDDY_CONNECTIONS_LIMIT=50
BUDDY_REQUESTS_PER_DAY=10
BUDDY_NOTIFICATION_BATCH_SIZE=50

# Socket.IO Configuration
SOCKET_CORS_ORIGIN=https://your-domain.com
SOCKET_PING_TIMEOUT=60000
SOCKET_PING_INTERVAL=25000
```

### 2. Frontend Environment Variables

Create `.env.production`:

```bash
# API Configuration
VITE_API_BASE_URL=https://your-api-domain.com/api

# Firebase Configuration (Public - OK to expose)
VITE_FIREBASE_API_KEY=AIzaSyBjcjXY3gGBqF36zQ6jtRs1gDmvf4Rv23M
VITE_FIREBASE_AUTH_DOMAIN=ntsschool-ab557.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ntsschool-ab557
VITE_FIREBASE_STORAGE_BUCKET=ntsschool-ab557.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=464327661262
VITE_FIREBASE_APP_ID=1:464327661262:web:e2495ad160e6b8a719629f

# Production Settings
VITE_NODE_ENV=production
VITE_APP_NAME=NTS Language Learning Platform

# Buddy System Settings 
VITE_BUDDY_FINDER_ENABLED=true
VITE_MAX_BUDDY_CONNECTIONS=50
VITE_NOTIFICATION_POLLING_INTERVAL=30000

# Real-time Features
VITE_SOCKET_URL=https://your-api-domain.com
VITE_ENABLE_REAL_TIME=true
```

## 🔥 Firebase Free Plan Optimization

### 1. Authentication Limits
- **10,000 phone verifications/month** (you're using email/password - unlimited)
- **Unlimited email/password authentications**
- **Unlimited Google OAuth authentications**

### 2. Optimization Strategies

#### Token Caching
The enhanced auth service implements:
- 5-minute token cache to reduce Firebase calls
- 10-minute user data cache
- 30-minute UID mapping cache

#### Request Optimization
- Client-side token refresh every 10 minutes
- Automatic retry with exponential backoff
- Queue failed requests during token refresh

### 3. Monitoring Usage

Add to your backend to monitor Firebase usage and buddy system performance:

```javascript
import { getCacheStats } from './utils/cache.js';

// Add endpoint to monitor cache performance
app.get('/api/admin/cache-stats', verifyToken, isAdmin, (req, res) => {
  res.json(getCacheStats());
});

// Monitor buddy system performance 
app.get('/api/admin/buddy-stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const stats = await BuddyConnection.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalUsers = await User.countDocuments({ buddyProfile: { $exists: true } });
    const activeConnections = await BuddyConnection.countDocuments({ status: 'active' });
    
    res.json({
      connectionStats: stats,
      totalBuddyUsers: totalUsers,
      activeConnections,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 🚨 Security Monitoring

### 1. Rate Limiting Alerts
Monitor rate limiting hits:

```javascript
// Add to your logging middleware
const logRateLimit = (req, res, next) => {
  if (res.getHeader('X-RateLimit-Remaining') < 10) {
    console.warn(`Rate limit warning for IP: ${req.ip}`);
  }
  next();
};
```

### 2. Failed Authentication Monitoring

```javascript
// Add to auth controller
const logFailedAuth = (ip, email, reason) => {
  console.error(`Failed auth: ${reason} - IP: ${ip}, Email: ${email}`);
  // Consider sending to monitoring service like Sentry
};
```

### 3. Buddy System Monitoring 

```javascript
// Monitor suspicious buddy activities
const logSuspiciousBuddyActivity = (userId, activity, details) => {
  console.warn(`Suspicious buddy activity: ${activity} - User: ${userId}`, details);
  // Log patterns like:
  // - Too many connection requests
  // - Rapid profile changes
  // - Mass messaging attempts
};

// Monitor connection success rates
const trackConnectionMetrics = async () => {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const requests = await BuddyConnection.countDocuments({
    requestedAt: { $gte: last24h }
  });
  
  const accepted = await BuddyConnection.countDocuments({
    status: 'active',
    acceptedAt: { $gte: last24h }
  });
  
  const successRate = requests > 0 ? (accepted / requests) * 100 : 0;
  
  console.log(`Buddy connection success rate (24h): ${successRate.toFixed(2)}%`);
  
  if (successRate < 20) {
    console.warn('Low buddy connection success rate detected!');
  }
};

// Run every hour
setInterval(trackConnectionMetrics, 60 * 60 * 1000);
```

## 📊 Production Health Checks

### 1. Backend Health Check

Add to your routes:

```javascript
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV
  });
});
```

### 2. Database Health Check

```javascript
router.get('/health/db', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    
    // Test buddy system collections 
    const buddyCount = await mongoose.connection.db.collection('buddies').estimatedDocumentCount();
    const connectionCount = await mongoose.connection.db.collection('buddyconnections').estimatedDocumentCount();
    
    res.json({ 
      database: 'connected',
      collections: {
        buddies: buddyCount,
        connections: connectionCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      database: 'disconnected', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

### 3. Buddy System Health Check 

```javascript
router.get('/health/buddy-system', verifyFirebaseAuth, async (req, res) => {
  try {
    // Test matching algorithm performance
    const startTime = Date.now();
    const sampleMatches = await Buddy.findPotentialMatches('sample-user-id', 5);
    const matchTime = Date.now() - startTime;
    
    // Test notification system
    const pendingNotifications = await BuddyConnection.countDocuments({
      status: 'pending',
      requestedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    res.json({
      status: 'healthy',
      performance: {
        matchingAlgorithmMs: matchTime,
        pendingNotifications
      },
      metrics: {
        activeUsers: await User.countDocuments({ 'lastActive': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
        activeBuddies: await Buddy.countDocuments({ isActive: true })
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

## 🔐 Additional Security Recommendations

### 1. HTTPS Enforcement
Ensure your hosting platform enforces HTTPS:

```javascript
// Add to server.js for HTTP to HTTPS redirect
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 2. Content Security Policy
The security middleware includes CSP headers. Adjust for your needs:

```javascript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:", "https://firebasestorage.googleapis.com"],
    scriptSrc: ["'self'", "https://www.gstatic.com"],
    connectSrc: [
      "'self'", 
      "https://your-api-domain.com", 
      "https://identitytoolkit.googleapis.com",
      "wss://your-api-domain.com" // For Socket.IO 
    ],
  },
}
```

## 🚀 Deployment Steps

### 1. Backend Deployment
1. Install production dependencies
2. Set environment variables
3. Run database migrations if any
4. Start with PM2 or similar process manager

### 2. Frontend Deployment
1. Build for production: `npm run build`
2. Deploy to CDN or static hosting
3. Configure domain and SSL
4. **Verify buddy finder routes work correctly** 
5. **Test real-time notifications in production** 

### 3. Post-Deployment Verification
1. Test authentication flow
2. Verify rate limiting works
3. Check error logging
4. Monitor Firebase usage
5. Test all critical user flows
6. **Test buddy matching algorithm performance** 
7. **Verify buddy connection workflow** 
8. **Test notification delivery system** 
9. **Check buddy system security measures** 

### 4. Buddy System Specific Tests 
```bash
# Test buddy profile creation
curl -X POST https://your-api-domain.com/api/buddies/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"targetLanguage": "japanese", "currentLevel": "B1"}'

# Test buddy search
curl -X GET "https://your-api-domain.com/api/buddies/find?language=japanese&level=B1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test buddy connection
curl -X POST https://your-api-domain.com/api/buddies/connect \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"receiverId": "BUDDY_USER_ID", "message": "Hello!"}'
```

### 5. Frontend Build Verification 
```bash
# Verify frontend builds without errors
cd frontend
npm run build

# Check for common issues
npm run lint
npm run type-check  # if using TypeScript

# Test critical routes
curl -f http://localhost:5173/ || echo "Landing page failed"
curl -f http://localhost:5173/buddy-finder || echo "Buddy finder failed"
curl -f http://localhost:5173/premium || echo "Premium page failed"
```

## 📈 Monitoring and Maintenance

### 1. Log Analysis
Monitor for:
- Failed authentication attempts
- Rate limit violations
- Firebase quota usage
- Database connection issues

### 2. Performance Monitoring
Track:
- Authentication response times
- Token refresh success rate
- Cache hit rates
- API endpoint performance
- **Buddy matching algorithm response times** 
- **Real-time notification delivery rates** 
- **Buddy connection success rates** 
- **Socket.IO connection stability** 

### 3. Security Monitoring
Watch for:
- Unusual login patterns
- Multiple failed attempts from same IP
- Suspicious user agent strings
- Cross-origin request violations
- **Excessive buddy connection requests** 
- **Spam in buddy messages** 
- **Unusual buddy profile changes** 
- **Abnormal notification patterns** 

### 4. Buddy System Analytics 
Monitor:
- Daily active buddy users
- Connection request to acceptance ratio
- Average time to find a match
- Most popular language pairs
- User engagement with buddy features
- Notification click-through rates
- Buddy session duration and frequency

## 🆘 Troubleshooting

### Common Issues:

1. **Firebase Token Expired**
   - Check token refresh logic
   - Verify Firebase configuration
   - Monitor token cache statistics

2. **Rate Limiting Issues**
   - Adjust rate limits in production
   - Monitor legitimate traffic patterns
   - Implement user-specific rate limits

3. **CORS Errors**
   - Verify production domain in CORS config
   - Check Firefox security settings
   - Ensure proper headers

4. **Database Connection Issues**
   - Check MongoDB Atlas IP whitelist
   - Verify connection string
   - Monitor connection pool usage

5. **Buddy System Issues** 
   - **No Matches Found**: Check matching algorithm parameters, verify user has complete profile
   - **Notifications Not Working**: Verify Socket.IO connection, check notification polling interval
   - **Connection Requests Failing**: Check rate limits, verify user authentication
   - **Profile Creation Errors**: Validate all required fields, check database constraints

6. **Real-time Features Issues** 
   - **Socket.IO Connection Drops**: Check ping/pong settings, verify CORS configuration
   - **Notifications Delayed**: Monitor notification queue, check batch processing
   - **Connection Status Not Updating**: Verify WebSocket stability, check client reconnection logic

7. **Frontend Build Issues** 
   - **Component Not Defined**: Ensure all components are properly imported in App.jsx
   - **Missing Route Components**: Verify all route components exist and are imported
   - **Build Failures**: Check for TypeScript errors, missing dependencies, or syntax issues
   - **Environment Variable Issues**: Verify all VITE_ prefixed variables are set correctly

## 🧪 Production Testing Checklist

### Core Features
- [ ] User registration and login
- [ ] Course access and progression
- [ ] Assessment system
- [ ] Progress tracking

### Frontend Build Verification 
- [ ] All components properly imported in App.jsx
- [ ] All routes have corresponding components
- [ ] No TypeScript/JavaScript errors in build
- [ ] All environment variables properly set
- [ ] Build process completes without warnings

### Buddy System 
- [ ] Buddy profile creation (all 4 steps)
- [ ] Buddy search and filtering
- [ ] Connection request workflow
- [ ] Real-time notifications
- [ ] Connection management (accept/decline)
- [ ] Activity tracking
- [ ] Rating and feedback system

### Performance Tests
- [ ] Page load times under 3 seconds
- [ ] API response times under 500ms
- [ ] Buddy matching under 2 seconds
- [ ] Notification delivery under 1 second
- [ ] Database query optimization
- [ ] Socket.IO connection stability

### Security Tests
- [ ] Authentication bypass attempts
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting effectiveness
- [ ] Buddy system abuse prevention

## 🚀 Scaling and Optimization

### Database Optimization 
```javascript
// Optimize buddy system queries
// Add compound indexes for better performance
db.buddies.createIndex({ targetLanguage: 1, currentLevel: 1, isActive: 1 });
db.buddies.createIndex({ timezone: 1, isActive: 1 });
db.buddies.createIndex({ interests: 1 });

db.buddyconnections.createIndex({ requester: 1, status: 1 });
db.buddyconnections.createIndex({ receiver: 1, status: 1 });
db.buddyconnections.createIndex({ status: 1, requestedAt: -1 });

// Create text index for buddy search
db.buddies.createIndex({ 
  "bio": "text", 
  "interests": "text",
  "learningGoals": "text" 
});
```

### Caching Strategy 
```javascript
// Cache frequently accessed data
const cacheStrategy = {
  // Cache buddy profiles for 10 minutes
  buddyProfiles: { ttl: 600 },
  
  // Cache popular matches for 5 minutes
  popularMatches: { ttl: 300 },
  
  // Cache user connections for 15 minutes
  userConnections: { ttl: 900 },
  
  // Cache notification counts for 2 minutes
  notificationCounts: { ttl: 120 }
};
```

### Load Balancing Considerations
- Use sticky sessions for Socket.IO
- Implement Redis adapter for Socket.IO clustering
- Cache buddy matching results
- Use CDN for static assets

### Monitoring and Alerts
```javascript
// Set up alerts for buddy system
const alerts = {
  highConnectionFailureRate: "> 30%",
  slowMatchingResponse: "> 3 seconds",
  highNotificationBacklog: "> 1000 pending",
  socketConnectionDrops: "> 10% per hour"
};
```

