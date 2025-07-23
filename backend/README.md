# NTS Language Learning Platform - Backend

A comprehensive backend API for the NTS Multi-Language Learning Platform built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: Firebase Auth integration with role-based access control
- **User Management**: Support for Students, Teachers, Parents, and Admins
- **Course Management**: CEFR-aligned language courses for grades 6-10
- **Progress Tracking**: Detailed learning analytics and progress monitoring
- **Language Buddy Finder**: AI-powered matching system for peer learning partners ⭐ NEW
- **Real-time Notifications**: Socket.IO-based notification system for buddy activities ⭐ NEW
- **Connection Management**: Comprehensive buddy request and relationship system ⭐ NEW
- **Gamification**: Points, badges, leaderboards, and achievements
- **Live Classes**: Video conferencing integration with Zoom
- **Chat System**: Real-time messaging with teacher support
- **AI Integration**: Speech-to-text and text-to-speech capabilities
- **Multi-language Support**: French, Japanese, German, Spanish, Korean, Chinese, Italian, Russian

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Firebase Admin SDK
- **Real-time**: Socket.IO
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer
- **Email**: Nodemailer
- **Payments**: Stripe integration
- **Caching**: Redis (optional)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB (local or cloud)
- Firebase project with Admin SDK
- Redis (optional, for caching)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with:
   - MongoDB connection string
   - Firebase Admin SDK credentials
   - JWT secret
   - Other service API keys

5. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | No (default: 5000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | Yes |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email | Yes |

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/verify-email` - Verify email address

### User Management

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/profile` - Delete user account
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id/role` - Update user role (Admin only)

### Course Management

- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create new course (Teacher/Admin)
- `PUT /api/courses/:id` - Update course (Teacher/Admin)
- `DELETE /api/courses/:id` - Delete course (Admin only)
- `POST /api/courses/:id/enroll` - Enroll in course
- `DELETE /api/courses/:id/unenroll` - Unenroll from course

### Progress Tracking

- `GET /api/progress/user/:userId` - Get user progress
- `GET /api/progress/user/:userId/course/:courseId` - Get course progress
- `PUT /api/progress/user/:userId/lesson/:lessonId` - Update lesson progress
- `GET /api/progress/user/:userId/analytics` - Get progress analytics

### Gamification

- `GET /api/gamification/user/:userId` - Get user gamification data
- `POST /api/gamification/user/:userId/points` - Award points
- `POST /api/gamification/user/:userId/badge` - Award badge
- `GET /api/gamification/leaderboard/global` - Get global leaderboard

### Language Buddy System ⭐ NEW

- `POST /api/buddies/profile` - Create/update buddy profile
- `GET /api/buddies/profile` - Get user's buddy profile
- `GET /api/buddies/find` - Find compatible language buddies
- `POST /api/buddies/connect` - Send buddy request
- `PUT /api/buddies/connections/:id/respond` - Accept/decline buddy request
- `GET /api/buddies/connections` - Get user's buddy connections
- `DELETE /api/buddies/connections/:id` - End buddy connection
- `GET /api/buddies/stats` - Get buddy system statistics
- `GET /api/buddies/activity` - Get recent buddy activity

### Live Classes

- `GET /api/live-classes` - Get all live classes
- `GET /api/live-classes/:id` - Get live class by ID
- `POST /api/live-classes` - Create live class (Teacher/Admin)
- `POST /api/live-classes/:id/join` - Join live class
- `POST /api/live-classes/:id/leave` - Leave live class

### Chat System

- `POST /api/chat/send` - Send message
- `GET /api/chat/messages/:chatId` - Get chat messages
- `GET /api/chat/history` - Get chat history
- `POST /api/chat/teachers/request` - Request teacher chat

## Database Schema

### User Model
- Basic information (name, email, role)
- Academic information (grade, school, board)
- Relationships (parent-child, teacher-student)
- Preferences and settings

### Course Model
- Course details (title, description, language, level)
- Academic mapping (grade, board)
- Enrollment tracking
- Cultural content modules

### Lesson Model
- Lesson content (video, interactive, quiz)
- Learning objectives and vocabulary
- AI features (speech recognition)
- Gamification elements

### Progress Model
- User progress tracking
- Activity completion status
- Quiz results and scores
- Speech and vocabulary progress

### Gamification Model
- Points and experience system
- Badges and achievements
- Leaderboards and streaks
- User statistics

### Buddy System Models ⭐ NEW
- **Buddy Model**: User profile with language preferences, interests, and learning goals
- **BuddyConnection Model**: Connection tracking with status, ratings, and activity logs
- Smart matching algorithm based on compatibility factors
- Real-time activity tracking and statistics

## Security Features

- **Authentication**: Firebase Auth integration
- **Authorization**: Role-based access control
- **Rate Limiting**: API request throttling
- **Input Validation**: Request data validation
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security headers
- **JWT**: Secure token-based authentication

## Development

### Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

### Code Structure

```
backend/
├── config/          # Configuration files
│   ├── database.js  # MongoDB connection
│   └── firebase.js  # Firebase Admin SDK
├── controllers/     # Route controllers
│   ├── authController.js
│   ├── userController.js
│   ├── buddyController.js  # ⭐ NEW: Buddy system logic
│   └── ...
├── middleware/      # Custom middleware
│   ├── auth.js      # Authentication middleware
│   ├── rateLimiter.js  # Rate limiting
│   └── validation.js   # Input validation
├── models/          # Database models
│   ├── User.js
│   ├── Course.js
│   ├── Buddy.js        # ⭐ NEW: Buddy profile model
│   ├── BuddyConnection.js  # ⭐ NEW: Connection model
│   └── ...
├── routes/          # API routes
│   ├── auth.js
│   ├── users.js
│   ├── buddies.js      # ⭐ NEW: Buddy system routes
│   └── ...
├── services/        # Business logic services
│   └── socketService.js  # Real-time features
├── utils/           # Utility functions
├── tests/           # Test files
└── server.js        # Main server file
```

## Deployment

### Production Environment

1. Set `NODE_ENV=production`
2. Configure production database
3. Set up proper logging
4. Configure reverse proxy (nginx)
5. Set up SSL certificates
6. Configure monitoring and alerts

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## Recent Updates

### v2.0.0 - Language Buddy Finder Release ⭐
- ✨ **NEW**: Complete Language Buddy Finder system with AI-powered matching
- 🤖 **NEW**: Smart buddy matching algorithm considering language level, timezone, and interests
- 🔔 **NEW**: Real-time notification system using Socket.IO
- 📊 **NEW**: Comprehensive buddy statistics and activity tracking
- 🛡️ **ENHANCED**: Security improvements with buddy-specific rate limiting
- 🔧 **FIXED**: MongoDB indexing optimizations to prevent duplicate warnings
- 📈 **IMPROVED**: Firebase authentication with graceful error handling

### Key Features Added:
- **Buddy Profile Management**: Complete CRUD operations for buddy profiles
- **Smart Matching System**: AI algorithm for compatible partner suggestions  
- **Connection Management**: Request, accept, decline, and manage buddy relationships
- **Real-time Features**: Instant notifications and activity updates
- **Performance Optimization**: Efficient database queries and caching strategies
- **Security Hardening**: Rate limiting and validation for social features


