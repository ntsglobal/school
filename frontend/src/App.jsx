import React from 'react';
import { Routes, Route } from 'react-router-dom';
import "@fortawesome/fontawesome-free/css/all.min.css";
import './i18n'; // Initialize i18n

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './pages/LandingPage/Hero';
import Features from './pages/LandingPage/Features';
import Login from './pages/LoginPage/Login';
import SignUp from './pages/SignUpPage/SignUp';
import ForgotPassword from './pages/ForgotPasswordPage/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPasswordPage/ResetPassword.jsx';
import RoleSelectionPage from './pages/RoleSelection/RoleSelectionPage';
import OnBoardingScreen1 from './pages/OnBoardingPage/OnBoardingScreen1';
import OnBoardingScreen2 from './pages/OnBoardingPage/OnBoardingScreen2';
import OnBoardingScreen3 from './pages/OnBoardingPage/OnBoardingScreen3';
import LandingPage from './pages/LandingPage/LandingPage.jsx';
import Contact from './pages/ContactPage/Contact.jsx';
import About from './pages/AboutPage/About.jsx';
import AssessmentPage from './pages/AssessmentPage/AssessmentPage.jsx';
import AssessmentDashboard from './pages/AssessmentDashboard/AssessmentDashboard.jsx';
import ParentPortal from './pages/ParentPortal/ParentPortal.jsx';
import GamificationDashboard from './pages/GamificationDashboard/GamificationDashboard.jsx';
import StudentDashboard from './pages/StudentDashboard/StudentDashboard.jsx';
import TeacherDashboard from './pages/TeacherDashboard/TeacherDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard.jsx';
import PrivacyPolicy from './pages/PrivacyPolicyPage/PrivacyPolicy';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage/PrivacyPolicyPage.jsx';
import LanguageSelectionPage from './pages/LanguageSelectionPage/LanguageSelectionPage.jsx';
import RecordedClasses from './pages/RecordedClasses/RecordedClasses.jsx';
import HelpCenter from './pages/HelpCenter/HelpCenter.jsx';
import Community from './pages/Community/Community.jsx';
import NewDiscussion from './pages/Community/NewDiscussion.jsx';
import CoursesPage from './pages/CoursesPage/CoursesPage.jsx';
import AILanguageLab from './pages/AILanguageLab/AILanguageLab.jsx';
import CultureExploration from './pages/CultureExploration/CultureExploration.jsx';
import LanguageBuddyPage from './pages/LanguageBuddyPage.jsx';
import PremiumPage from './pages/PremiumPage/PremiumPage.jsx';
import LiveClassVideoRoom from './components/LiveClassVideoRoom.jsx';
import LiveClassesPage from './pages/LiveClassesPage/LiveClassesPage.jsx';
import LiveClassDetailPage from './pages/LiveClassDetailPage/LiveClassDetailPage.jsx';


function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Landing Page Route */}
        <Route
          path="/"
          element={
            <div>
              <Navbar />
              <LandingPage />
              <Footer />
            </div>
          }
        />
        
        {/* Role Selection Page shown first */}
        <Route path="/role-selection" element={
          <div>
            <RoleSelectionPage />
            <Footer />
          </div>
        } />

        {/* Login/Register Page Route */}
        <Route path="/login" element={
          <div>
            <Navbar />
            <Login />
            <Footer />
          </div>
        } />

        {/* Sign Up Page Route */}
        <Route path="/signup" element={ 
          <div>
            <Navbar />
            <SignUp />
            <Footer />
          </div>
        } />

        {/* Forgot Password Page Route */} 
        <Route path="/forgot-password" element={
          <div>
            <Navbar />
            <ForgotPassword />
            <Footer />
          </div>
        } />

        {/* Reset Password Page Route */}
        <Route path="/reset-password" element={
          <div>
            <ResetPassword />
            <Footer />
          </div>
        } />

        {/* Onboarding Page */}
        <Route path="/onboarding/step1" element={
          <ProtectedRoute>
            <div>
              <Navbar />
              <OnBoardingScreen1 />
              <Footer />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/onboarding/step2" element={
          <ProtectedRoute>
            <div>
              <Navbar />
              <OnBoardingScreen2 />
              <Footer />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/onboarding/step3" element={
          <ProtectedRoute>
            <div>
              <Navbar />
              <OnBoardingScreen3 />
              <Footer />
            </div>
          </ProtectedRoute>
        } />

        {/* Language Selection Page */}
        <Route path="/language-selection" element={
          <ProtectedRoute>
            <LanguageSelectionPage />
          </ProtectedRoute>
        } />

        {/* Privacy Policy Page */}
        <Route path="/privacy-policy" element={
          <div>
            <Navbar />
            <PrivacyPolicy />
            <Footer />
          </div>
        } />

        {/* About Page */}
        <Route path="/about" element={
          <div>
            <Navbar />
            <About />
            <Footer />
          </div>
        } />

        {/* Contact Page */}
        <Route path="/contact" element={
          <div>
            <Navbar />
            <Contact />
            <Footer />
          </div>
        } />

        {/* Assessment Page */}
        <Route path="/assessment" element={
          <ProtectedRoute>
            <AssessmentPage />
          </ProtectedRoute>
        } />

        {/* Assessment Dashboard */}
        <Route path="/assessment-dashboard" element={
          <ProtectedRoute>
            <AssessmentDashboard />
          </ProtectedRoute>
        } />

        {/* Parent Portal */}
        <Route path="/parent-portal" element={
          <ProtectedRoute>
            <ParentPortal />
          </ProtectedRoute>
        } />

        {/* Student Dashboard */}
        <Route path="/student-dashboard" element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        } />

        {/* Teacher Dashboard */}
        <Route path="/teacher-dashboard" element={
          <ProtectedRoute>
            <TeacherDashboard />
          </ProtectedRoute>
        } />

        {/* Admin Dashboard */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Gamification Dashboard */}
        <Route path="/gamification" element={
          <ProtectedRoute>
            <GamificationDashboard />
          </ProtectedRoute>
        } />

        {/* Recorded Classes Page */}
        <Route path="/recorded-classes" element={
          <ProtectedRoute>
            <div>
              <Navbar />
              <RecordedClasses />
              <Footer />
            </div>
          </ProtectedRoute>
        } />

        {/* Help Center Page */}
        <Route path="/help-center" element={
          <div>
            <Navbar />
            <HelpCenter />
            <Footer />
          </div>
        } />

        {/* Courses Page */}
        <Route path="/courses" element={
          <div>
            <Navbar />
            <CoursesPage />
            <Footer />
          </div>
        } />

        {/* Community Page */}
        <Route path="/community" element={
          <ProtectedRoute>
            <Community />
          </ProtectedRoute>
        } />

        {/* New Discussion Page */}
        <Route path="/community/new-discussion" element={
          <ProtectedRoute>
            <NewDiscussion />
          </ProtectedRoute>
        } />

        {/* Language Buddy Finder Page */}
        <Route path="/buddy-finder" element={
          <ProtectedRoute>
            <div>
              <Navbar />
              <LanguageBuddyPage />
              <Footer />
            </div>
          </ProtectedRoute>
        } />

        {/* AI Language Lab Pages */}
        <Route path="/language-lab" element={
          <ProtectedRoute>
            <div>
              <Navbar />
              <AILanguageLab />
              <Footer />
            </div>
          </ProtectedRoute>
        } />

        {/* Culture Exploration Page */}
        <Route path="/culture-exploration" element={
          <ProtectedRoute>
            <div>
              <Navbar />
              <CultureExploration />
              <Footer />
            </div>
          </ProtectedRoute>
        } />

        {/* Live Classes Page */}
        <Route path="/live-classes" element={
          <ProtectedRoute>
            <LiveClassesPage />
          </ProtectedRoute>
        } />

        {/* Live Class Detail Page */}
        <Route path="/live-classes/:id" element={
          <ProtectedRoute>
            <LiveClassDetailPage />
          </ProtectedRoute>
        } />

        {/* Live Class Video Room */}
        <Route path="/live-classes/:id/video" element={
          <ProtectedRoute>
            <LiveClassVideoRoom />
          </ProtectedRoute>
        } />

        {/* Premium Page */}
        <Route path="/premium" element={
          <ProtectedRoute>
            <div>
              <Navbar />
              <PremiumPage />
              <Footer />
            </div>
          </ProtectedRoute>
        } />

        {/* Pricing Page (alias for Premium) */}
        <Route path="/pricing" element={
          <ProtectedRoute>
            <div>
              <Navbar />
              <PremiumPage />
              <Footer />
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;