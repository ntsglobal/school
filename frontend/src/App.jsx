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
import PrivacyPolicyPage from './pages/PrivacyPolicyPage/PrivacyPolicyPage.jsx';
import LanguageSelectionPage from './pages/LanguageSelectionPage/LanguageSelectionPage.jsx';
import RecordedClasses from './pages/RecordedClasses/RecordedClasses.jsx';
import HelpCenter from './pages/HelpCenter/HelpCenter.jsx';
import Community from './pages/Community/Community.jsx';
import CoursesPage from './pages/CoursesPage/CoursesPage.jsx';
import AILanguageLab from './pages/AILanguageLab/AILanguageLab.jsx';
import CultureExploration from './pages/CultureExploration/CultureExploration.jsx';
import LanguageBuddyPage from './pages/LanguageBuddyPage.jsx';
import PremiumPage from './pages/PremiumPage/PremiumPage.jsx';


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
        {/* ✅ Role Selection Page shown first */}
        <Route path="/role-selection" element={
          <div>
          <RoleSelectionPage />
          <Footer />
          </div>} />

        {/* Login/Register Page Route */}
        <Route path="/login" element={
          <div>
            <Login />
            <Footer />
          </div>} />

        {/* Sign In Page Route */}
        <Route path="/signup" element={ 
          <div>
            <SignUp />
            <Footer />
          </div>} />

        {/* Forgot Password Page Route */} 
        <Route path="/forgot-password" element={
          <div>
          <ForgotPassword />
          <Footer />
          </div>} />

        {/* Reset Password Page Route */}
        <Route path="/reset-password" element={
          <div>
          <ResetPassword />
          <Footer />
          </div>} />

        {/* Reset Password Page Route */} 
        <Route path="/reset-password" element={
          <div>
          <ResetPassword />
          <Footer />
          </div>} />

        {/* Onboarding Page  */}
        <Route path="/onboarding/step1" element={
          <ProtectedRoute>
            <OnBoardingScreen1 />
          </ProtectedRoute>
        } />
        <Route path="/onboarding/step2" element={
          <ProtectedRoute>
            <OnBoardingScreen2 />
          </ProtectedRoute>
        } />
        <Route path="/onboarding/step3" element={
          <ProtectedRoute>
            <OnBoardingScreen3 />
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
            <PrivacyPolicyPage />
            <Footer />
          </div>} />

        {/* About Page */}
        <Route path="/about" element={
          <div>
            <Navbar />
            <About />
            <Footer />
          </div>} />

        {/* Assessment Page */}
        <Route path="/assessment" element={<AssessmentPage />} />

        {/* Assessment Page */}
        <Route path="/assessment" element={<AssessmentPage />} />

        {/* Assessment Dashboard */}
        <Route path="/assessment-dashboard" element={<AssessmentDashboard />} />

        {/* Parent Portal */}
        <Route path="/parent-portal" element={<ParentPortal />} />

        {/* Student Dashboard */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />

        {/* Gamification Dashboard */}
        <Route path="/gamification" element={<GamificationDashboard />} />

        {/* Contact Page */}
        <Route path="/contact" element={
          <div>
            <Navbar />
            <Contact />
            <Footer />
          </div>} />

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
            <div>
              <Navbar />
              <Community />
              <Footer />
            </div>
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

        {/* AI Language Lab Page */}
        <Route path="/language-lab" element={
          <ProtectedRoute>
            <div>
              <Navbar />
              <AILanguageLab />
              <Footer />
            </div>
          </ProtectedRoute>
        } />

        <Route path="/culture-exploration" element={
          <ProtectedRoute>
            <div>
              <Navbar />
              <CultureExploration />
              <Footer />
            </div>
          </ProtectedRoute>
        } />
                        <Route path="/premium" element={
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