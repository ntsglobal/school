# NTS Green School - Language Learning Platform 🌟

A comprehensive language learning platform built with React, Node.js, MongoDB, and Firebase, designed to provide interactive Japanese, French, and Spanish language education with gamification, live classes, progress tracking, and **Language Buddy Finder** for peer-to-peer learning.

## 🚀 Features

### 🎓 **Core Learning Features**
- **Multi-Language Support**: Japanese, French, Spanish, German, Korean, Chinese, Italian, and Russian courses
- **Interactive Lessons**: Comprehensive lesson plans with video, audio, and text content
- **Speech Recognition**: AI-powered pronunciation training and assessment
- **Live Classes**: Real-time video conferencing with instructors
- **Assessments**: Comprehensive testing system with instant feedback
- **Progress Tracking**: Detailed analytics and progress visualization

### 🤝 **Language Buddy Finder** ⭐ *NEW*
- **Smart Matching Algorithm**: AI-powered matching based on language level, timezone, interests, and learning goals
- **Profile Setup Wizard**: 4-step guided profile creation for optimal matches
- **Advanced Filtering**: Filter buddies by language, grade, timezone, and proficiency level
- **Connection Management**: Send, accept, decline buddy requests with messaging
- **Real-time Notifications**: Instant alerts for new requests, messages, and activity
- **Activity Tracking**: Monitor practice sessions and learning progress with buddies
- **Rating & Feedback System**: Rate buddy interactions and provide constructive feedback
- **Global Community**: Connect with language learners from around the world 24/7

### 🎮 **Gamification System**
- **XP Points & Levels**: Earn experience points and level up
- **Achievements & Badges**: Unlock badges for completing milestones
- **Streak Tracking**: Daily learning streak monitoring
- **Leaderboards**: Compete with classmates and global users
- **Goal Setting**: Personal learning objectives and tracking

### 👥 **User Management**
- **Multi-Role System**: Students, Parents, Teachers, and Administrators
- **Authentication**: Firebase Auth with email/password and Google OAuth
- **Parental Controls**: Parent portal for monitoring student progress
- **Teacher Dashboard**: Class management and student assessment tools

### 📊 **Analytics & Dashboards**
- **Student Dashboard**: Personal progress, courses, and achievements
- **Parent Portal**: Child's progress monitoring and communication
- **Assessment Dashboard**: Test results and performance analytics
- **Gamification Dashboard**: XP tracking, achievements, and leaderboards
- **Buddy Statistics**: Connection analytics, match success rates, and activity insights

### 🔒 **Security & Performance**
- **Production-Grade Security**: Rate limiting, input validation, CORS protection
- **Firebase Optimization**: Token caching and graceful error handling for free tier compatibility
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Real-time Features**: Socket.io for live chat and notifications

## 🌟 Features

### Multi-language Support
- **Languages**: French, Japanese, German, Spanish, Korean
- **CEFR Levels**: A1, A2, B1 aligned curriculum
- **Grade Mapping**: Tailored for Classes 6 to 10
- **Board Support**: CBSE, ICSE, International boards

### Gamified Learning
- Points, badges, and leaderboards
- Daily streaks and goal tracking
- Achievement system
- Progress milestones

### Live Interactive Classes
- Scheduled live classes with language experts
- Small batch sizes for personalized attention
- Video conferencing integration
- Recording and playback

### AI-powered Language Lab
- Speech-to-text for pronunciation accuracy
- Text-to-speech practice for fluency
- Real-time feedback on speaking
- Pronunciation scoring

### Interactive Assessments
- End-of-module quizzes
- Reading, listening, speaking, and writing tasks
- Adaptive difficulty levels
- Detailed performance analytics

### Progress Tracking
- Weekly and monthly reports
- Performance analytics and milestones
- Parent and teacher dashboards
- Learning path recommendations

### Cultural Immersion
- Country-specific content (festivals, food, etiquette)
- Interactive videos and games
- Storytelling formats
- Cultural context learning

### Community Features
- **Language Buddy Finder**: AI-powered matching system for peer learning partners
- **Smart Buddy Matching**: Compatible partners based on learning goals, language level, timezone, and interests
- **Connection Management**: Comprehensive request system with accept/decline functionality
- **Real-time Buddy Notifications**: Instant alerts for new connections, messages, and activity updates
- **Student Discussion Forums**: Community-driven learning discussions
- **Teacher Chat Support**: Direct communication with language instructors
- **Peer Learning Groups**: Collaborative study sessions and practice groups
- **Global Learning Community**: Connect with learners worldwide across all time zones

## 🏗️ Architecture

### Frontend
- **Web**: React.js + Tailwind CSS (Responsive)
- **Mobile**: React Native (Cross-platform)
- **State Management**: React Context + Hooks
- **Routing**: React Router DOM

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Firebase Auth
- **Real-time**: Socket.IO
- **File Storage**: Multer + Cloud Storage

### AI Components
- **Speech-to-Text**: Google Cloud Speech API / AssemblyAI
- **Text-to-Speech**: Google TTS / Amazon Polly
- **Pronunciation**: Whisper + Custom ML models

### Infrastructure
- **Deployment**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Health checks and logging
- **Caching**: Redis (optional)

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- MongoDB (local or cloud)
- Firebase project
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd NTS_SCHOOL
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Configure your .env file
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/api/health
- **Language Buddy Finder**: http://localhost:5173/buddy-finder ⭐

### Using Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🤝 Language Buddy Finder Guide ⭐

### Getting Started with Buddy Finder

1. **Profile Setup**: Complete the 4-step buddy profile wizard
   - Step 1: Language preferences and learning goals
   - Step 2: Proficiency levels and target languages
   - Step 3: Interests and hobbies for better matching
   - Step 4: Bio and availability preferences

2. **Finding Buddies**: Use the smart search and filtering system
   - Filter by language, grade level, timezone
   - View compatibility scores based on AI matching
   - See detailed buddy profiles with interests and goals

3. **Making Connections**: Send and manage buddy requests
   - Send personalized connection requests
   - Accept or decline incoming requests
   - Manage active buddy relationships

4. **Staying Engaged**: Use the notification and activity system
   - Real-time notifications for new requests
   - Track practice sessions with buddies
   - Rate and provide feedback on buddy interactions

### Buddy Matching Algorithm

The system uses an intelligent matching algorithm that considers:
- **Language Compatibility**: Matches complementary language learners
- **Proficiency Levels**: Ensures appropriate learning partnerships
- **Timezone Overlap**: Finds buddies with compatible schedules
- **Shared Interests**: Matches based on hobbies and topics of interest
- **Learning Goals**: Aligns users with similar objectives
- **Activity Patterns**: Considers learning frequency and style

## 📁 Project Structure

```
NTS_SCHOOL/
├── backend/                    # Node.js API server
│   ├── config/                # Configuration files
│   │   ├── database.js        # MongoDB connection
│   │   └── firebase.js        # Firebase Admin SDK setup
│   ├── controllers/           # Route controllers
│   │   ├── authController.js  # Authentication logic
│   │   ├── userController.js  # User management
│   │   ├── courseController.js# Course operations
│   │   ├── buddyController.js # Language buddy system ⭐ NEW
│   │   └── ...               # Other controllers
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js           # Authentication middleware
│   │   ├── errorHandler.js   # Error handling
│   │   └── rateLimiter.js    # Rate limiting
│   ├── models/                # Database models
│   │   ├── User.js           # User schema
│   │   ├── Course.js         # Course schema
│   │   ├── Buddy.js          # Buddy profile schema ⭐ NEW
│   │   ├── BuddyConnection.js# Buddy connections ⭐ NEW
│   │   └── ...               # Other models
│   ├── routes/                # API routes
│   │   ├── auth.js           # Authentication routes
│   │   ├── users.js          # User routes
│   │   ├── buddies.js        # Buddy system routes ⭐ NEW
│   │   └── ...               # Other routes
│   ├── services/              # Business logic services
│   │   └── socketService.js  # Real-time features
│   └── server.js             # Main server file
├── frontend/                  # React.js application
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── Navbar.jsx    # Navigation with Buddy Finder link
│   │   │   ├── LanguageBuddyFinder.jsx      # Main buddy interface ⭐ NEW
│   │   │   ├── BuddyProfileSetup.jsx        # Profile creation wizard ⭐ NEW
│   │   │   ├── BuddyConnections.jsx         # Connection management ⭐ NEW
│   │   │   ├── BuddyNotifications.jsx       # Real-time notifications ⭐ NEW
│   │   │   └── ...                          # Other components
│   │   ├── pages/             # Page components
│   │   │   ├── LanguageBuddyPage.jsx        # Main buddy page ⭐ NEW
│   │   │   └── ...                          # Other pages
│   │   ├── services/          # API services
│   │   │   ├── api.js        # Base API configuration
│   │   │   ├── buddyService.js              # Buddy API calls ⭐ NEW
│   │   │   └── ...           # Other services
│   │   ├── contexts/          # React contexts
│   │   │   └── AuthContext.jsx# Authentication context
│   │   └── App.jsx            # Main app component with buddy routes
│   └── public/                # Static assets
│       └── images/            # Image assets
├── docker-compose.yml         # Docker services
└── README.md                 # This file
```

## 🔧 Configuration

### Backend Environment Variables
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nts-language-learning
JWT_SECRET=your-jwt-secret
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
```

### Frontend Environment Variables
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
```

## 👥 User Roles

### Student
- Access courses and lessons
- Track progress and achievements
- Participate in live classes
- **Use Language Buddy Finder to connect with learning partners** ⭐
- **Manage buddy relationships and practice sessions** ⭐
- Chat with teachers and buddies
- View gamification data and buddy statistics

### Teacher
- Create and manage courses
- Conduct live classes
- Monitor student progress including buddy activities
- Provide chat support
- Grade assignments
- **View buddy interaction analytics** ⭐

### Parent
- View child's progress including buddy learning activities
- Access reports and analytics with buddy engagement metrics
- Communicate with teachers about buddy interactions
- Monitor learning activities and social connections
- **Approve or manage child's buddy connections** ⭐

### Admin
- Manage all users and content
- **Oversee buddy system and community safety** ⭐
- System configuration including buddy matching parameters
- Analytics and reporting with buddy system insights
- Content moderation and user safety

## 🎯 Development Phases

### ✅ Phase 1: Core Backend & Authentication
- [x] Backend project setup
- [x] Database schema design
- [x] Authentication system with Firebase
- [x] Core API endpoints
- [x] Frontend-backend integration
- [x] Environment configuration
- [x] Production-grade security (rate limiting, validation)
- [x] MongoDB optimization and indexing

### ✅ Phase 2: Language Buddy Finder System ⭐ *COMPLETED*
- [x] Buddy profile management system
- [x] Smart matching algorithm based on preferences
- [x] Connection request and management system
- [x] Real-time notifications for buddy activities
- [x] Activity tracking and statistics
- [x] Rating and feedback system
- [x] Comprehensive buddy dashboard interface
- [x] Mobile-responsive buddy finder UI

### 🔄 Phase 3: Learning Management System
- [ ] Course and lesson management
- [ ] CEFR level mapping (A1, A2, B1, B2, C1, C2)
- [ ] Content structure and organization
- [ ] Progress tracking system
- [ ] Assessment integration

### 📋 Phase 4: Gamification Engine
- [ ] Points and XP system
- [ ] Badges and achievements
- [ ] Leaderboards with buddy connections
- [ ] Streak tracking with buddy practice sessions

### 🤖 Phase 5: AI Language Lab
- [ ] Speech-to-text integration
- [ ] Text-to-speech features
- [ ] Pronunciation feedback
- [ ] Language processing with buddy practice

### 🎥 Phase 6: Live Features & Communication
- [ ] Live class system
- [ ] Video conferencing for buddy sessions
- [ ] Real-time chat integration
- [ ] Teacher support system

### 🌍 Phase 7: Advanced Features & Community Enhancement
- [ ] Cultural immersion modules
- [ ] Advanced buddy matching with AI
- [ ] Community challenges and events
- [ ] Advanced analytics dashboard
- [ ] Content management system

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
npm run test:watch

# Test buddy system endpoints
npm run test:buddies
```

### Frontend Testing
```bash
cd frontend
npm test
npm run test:coverage

# Test buddy finder components
npm run test:buddy-components
```

### Buddy System Testing
```bash
# Test buddy matching algorithm
npm run test:matching

# Test connection management
npm run test:connections

# Test notification system
npm run test:notifications
```

## 📊 API Documentation

The API documentation is available at `/api/docs` when running the backend server.

### Key Endpoints:

**Authentication & Users:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/profile` - Get user profile

**Courses & Learning:**
- `GET /api/courses` - Get all courses
- `GET /api/progress/user/:id` - Get user progress
- `GET /api/lessons/:courseId` - Get course lessons

**Language Buddy System ⭐ NEW:**
- `POST /api/buddies/profile` - Create/update buddy profile
- `GET /api/buddies/profile` - Get user's buddy profile
- `GET /api/buddies/find` - Find compatible language buddies
- `POST /api/buddies/connect` - Send buddy request
- `PUT /api/buddies/connections/:id/respond` - Accept/decline buddy request
- `GET /api/buddies/connections` - Get user's buddy connections
- `GET /api/buddies/stats` - Get buddy system statistics
- `GET /api/buddies/activity` - Get recent buddy activity

**Health & Monitoring:**
- `GET /api/health` - Server health check
- `GET /api/health/db` - Database connectivity check



## 🌟 Latest Updates

### v2.0.0 - Language Buddy Finder Release
- ✨ **NEW**: Complete Language Buddy Finder system
- 🤖 **NEW**: AI-powered buddy matching algorithm
- 🔔 **NEW**: Real-time notifications for buddy activities
- 📊 **NEW**: Buddy statistics and activity tracking
- 🎨 **IMPROVED**: Enhanced UI/UX with mobile responsiveness
- 🔧 **FIXED**: MongoDB indexing optimizations
- 🛡️ **ENHANCED**: Security improvements and error handling

---

