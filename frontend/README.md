# NTS Language Learning Platform - Frontend

A modern, responsive React application for the NTS Multi-Language Learning Platform with comprehensive language learning features and social buddy system.

## ✨ Features

### 🎓 **Core Learning Features**
- **Multi-Language Support**: Learn French, Japanese, German, Spanish, Korean, Chinese, Italian, and Russian
- **Interactive Lessons**: Rich multimedia content with video, audio, and interactive exercises
- **Progress Tracking**: Detailed analytics and achievement monitoring
- **Assessment System**: Comprehensive quizzes and testing with instant feedback
- **Gamification**: Points, badges, leaderboards, and achievement tracking

### 🤝 **Language Buddy Finder** ⭐ NEW
- **Smart Matching System**: AI-powered buddy matching based on language level, timezone, and interests
- **Profile Setup Wizard**: 4-step guided profile creation for optimal matches
- **Advanced Filtering**: Filter potential buddies by language, grade, timezone, and proficiency
- **Connection Management**: Send, accept, decline, and manage buddy relationships
- **Real-time Notifications**: Instant alerts for new requests, messages, and buddy activities
- **Activity Tracking**: Monitor practice sessions and learning progress with buddies
- **Rating System**: Rate and provide feedback on buddy interactions

### 👥 **User Management**
- **Multi-Role Support**: Students, Teachers, Parents, and Administrators
- **Authentication**: Firebase Auth with email/password and Google OAuth
- **Profile Management**: Comprehensive user profiles with learning preferences
- **Parental Controls**: Parent portal for monitoring child progress

### 📊 **Analytics & Dashboards**
- **Student Dashboard**: Personal progress, courses, and achievements
- **Parent Portal**: Child progress monitoring and communication tools
- **Teacher Dashboard**: Class management and student assessment
- **Buddy Analytics**: Connection success rates and activity insights

## 🛠️ Tech Stack

- **Framework**: React 18 with hooks and functional components
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for responsive, utility-first styling
- **Icons**: React Icons and Font Awesome
- **Routing**: React Router DOM for SPA navigation
- **State Management**: React Context and hooks
- **HTTP Client**: Axios with interceptors for API communication
- **Authentication**: Firebase Auth integration
- **Real-time**: Socket.IO client for live features
- **Internationalization**: React i18next for multi-language support

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Backend API running on port 5000

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

4. **Configure your `.env` file:**
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Buddy System Configuration
VITE_BUDDY_FINDER_ENABLED=true
VITE_MAX_BUDDY_CONNECTIONS=50
VITE_NOTIFICATION_POLLING_INTERVAL=30000
```

5. **Start the development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
frontend/
├── public/                  # Static assets
│   ├── images/             # Image assets
│   │   ├── bgImage.png
│   │   ├── classroom.png
│   │   └── icons/          # Icon assets
│   └── vite.svg
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.jsx     # Navigation with buddy finder
│   │   ├── Footer.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── LanguageBuddyFinder.jsx      # ⭐ Main buddy interface
│   │   ├── BuddyProfileSetup.jsx        # ⭐ Profile wizard
│   │   ├── BuddyConnections.jsx         # ⭐ Connection management
│   │   ├── BuddyNotifications.jsx       # ⭐ Real-time notifications
│   │   ├── CourseCard.jsx
│   │   ├── ProgressDashboard.jsx
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── LandingPage/    # Home page components
│   │   ├── LoginPage/      # Authentication pages
│   │   ├── StudentDashboard/
│   │   ├── LanguageBuddyPage.jsx        # ⭐ Main buddy page
│   │   └── ...
│   ├── services/           # API and external services
│   │   ├── api.js         # Base API configuration
│   │   ├── authService.js # Authentication service
│   │   ├── buddyService.js             # ⭐ Buddy system API
│   │   ├── courseService.js
│   │   └── ...
│   ├── contexts/           # React contexts
│   │   └── AuthContext.jsx # Authentication context
│   ├── assets/             # Application assets
│   ├── App.jsx            # Main application component
│   ├── main.jsx           # Application entry point
│   └── index.css          # Global styles
├── .env.example            # Environment variables template
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
└── vite.config.js         # Vite configuration
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality
- `npm run lint:fix` - Fix ESLint issues automatically

## 🎨 Key Components

### Language Buddy System ⭐
- **LanguageBuddyFinder**: Main interface for finding and connecting with language partners
- **BuddyProfileSetup**: 4-step wizard for creating comprehensive buddy profiles
- **BuddyConnections**: Management interface for buddy requests and active connections
- **BuddyNotifications**: Real-time notification system with quick actions

### Authentication & Navigation
- **AuthContext**: Global authentication state management
- **ProtectedRoute**: Route protection based on authentication status
- **Navbar**: Responsive navigation with buddy finder integration

### Dashboard Components
- **StudentDashboard**: Comprehensive learning progress and activity overview
- **ProgressDashboard**: Detailed analytics and achievement tracking
- **GamificationDashboard**: Points, badges, and leaderboard displays

## 🔐 Authentication Flow

1. **Firebase Authentication**: Email/password and Google OAuth integration
2. **Token Management**: Automatic token refresh and secure storage
3. **Role-based Access**: Different interfaces for Students, Teachers, Parents, and Admins
4. **Protected Routes**: Authentication-gated access to sensitive areas

## 🌐 API Integration

### Base Configuration
- Axios interceptors for automatic token attachment
- Request/response logging for debugging
- Error handling with user-friendly messages
- Rate limiting respect and retry logic

### Buddy System APIs
- Profile management with validation
- Smart matching with filtering options
- Connection lifecycle management
- Real-time notification handling

## 📱 Responsive Design

- **Mobile-first approach** with Tailwind CSS
- **Responsive breakpoints** for all screen sizes
- **Touch-friendly interfaces** for mobile devices
- **Progressive enhancement** for advanced features

## 🔔 Real-time Features

- **Socket.IO integration** for live updates
- **Buddy activity notifications** with instant delivery
- **Connection status updates** in real-time
- **Notification management** with read/unread tracking

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🚀 Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Build Optimization
- **Code splitting** for optimal loading
- **Asset optimization** with Vite
- **Bundle analysis** for performance monitoring
- **Progressive Web App** features ready

## 🌟 Recent Updates

### v2.0.0 - Language Buddy Finder Release ⭐
- ✨ **NEW**: Complete Language Buddy Finder system
- 🤖 **NEW**: AI-powered buddy matching interface
- 🔔 **NEW**: Real-time notification system
- 📊 **NEW**: Buddy statistics and analytics dashboard
- 🎨 **IMPROVED**: Enhanced UI/UX with mobile responsiveness
- 🛡️ **ENHANCED**: Security improvements and error handling
- ⚡ **OPTIMIZED**: Performance improvements and code splitting

### Key Features Added:
- **Buddy Profile Management**: Complete profile setup and editing system
- **Smart Matching Interface**: Advanced filtering and compatibility scoring
- **Connection Workflow**: Comprehensive request and relationship management
- **Notification System**: Real-time alerts with quick action capabilities
- **Activity Tracking**: Detailed buddy interaction analytics
- **Mobile Optimization**: Fully responsive buddy finder interface

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow React best practices and hooks patterns
- Use Tailwind CSS for consistent styling
- Write comprehensive tests for new features
- Ensure mobile responsiveness for all components
- Follow the established file structure and naming conventions

---

