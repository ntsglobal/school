import React from 'react';
import { Routes, Route } from 'react-router-dom';
import "@fortawesome/fontawesome-free/css/all.min.css";
import './i18n'; // Initialize i18n

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute, {
  StudentRoute,
  TeacherRoute,
  ParentRoute,
  AdminRoute,
  TeacherOrAdminRoute,
  ParentOrAdminRoute
} from './components/ProtectedRoute';
import DashboardRedirect from './components/DashboardRedirect';
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
import UnauthorizedPage from './pages/UnauthorizedPage/UnauthorizedPage.jsx';
import Terms from "./pages/TermsPage/Terms";
function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
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

        <Route path="/about" element={
          <div>
            <Navbar />
            <About />
            <Footer />
          </div>
        } />

        <Route path="/contact" element={
          <div>
            <Navbar />
            <Contact />
            <Footer />
          </div>
        } />

        <Route path="/courses" element={
          <div>
            <Navbar />
            <CoursesPage />
            <Footer />
          </div>
        } />

        <Route path="/help-center" element={
          <>
            <Navbar />
            <HelpCenter />
            <Footer />
          </>
        } />

        <Route path="/privacy-policy" element={
          <div>
            <Navbar />
            <PrivacyPolicy />
            <Footer />
          </div>
        } />

        <Route path="/terms-of-service" element={
          <div>
            <Navbar />
            <Terms />
            <Footer />
          </div>
        } />

        {/* Authentication Routes */}
        <Route path="/role-selection" element={
          <div>
            <RoleSelectionPage />
            <Footer />
          </div>
        } />

        <Route path="/login" element={
          <div>
            <Navbar />
            <Login />
            <Footer />
          </div>
        } />

        <Route path="/signup" element={
          <div>
            <Navbar />
            <SignUp />
            <Footer />
          </div>
        } />

        <Route path="/forgot-password" element={
          <div>
            <Navbar />
            <ForgotPassword />
            <Footer />
          </div>
        } />

        <Route path="/reset-password" element={
          <div>
            <ResetPassword />
            <Footer />
          </div>
        } />

        {/* Dashboard Redirect Route */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Protected Onboarding Routes */}
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

        <Route path="/language-selection" element={
          <ProtectedRoute>
            <LanguageSelectionPage />
          </ProtectedRoute>
        } />

        {/* Student-Only Routes */}
        <Route path="/student-dashboard" element={
          <StudentRoute>
            <StudentDashboard />
          </StudentRoute>
        } />

        <Route path="/assessment" element={
          <StudentRoute>
            <AssessmentPage />
          </StudentRoute>
        } />

        <Route path="/language-lab" element={
          <StudentRoute>
            <div>
              <Navbar />
              <AILanguageLab />
              <Footer />
            </div>
          </StudentRoute>
        } />

        <Route path="/culture-exploration" element={
          <StudentRoute>
            <div>
              <Navbar />
              <CultureExploration />
              <Footer />
            </div>
          </StudentRoute>
        } />

        <Route path="/buddy-finder" element={
          <StudentRoute>
            <div>
              <Navbar />
              <LanguageBuddyPage />
              <Footer />
            </div>
          </StudentRoute>
        } />

        <Route path="/gamification" element={
          <StudentRoute>
            <GamificationDashboard />
          </StudentRoute>
        } />

        {/* Teacher-Only Routes */}
        <Route path="/teacher-dashboard" element={
          <TeacherRoute>
            <TeacherDashboard />
          </TeacherRoute>
        } />

        <Route path="/assessment-dashboard" element={
          <TeacherOrAdminRoute>
            <AssessmentDashboard />
          </TeacherOrAdminRoute>
        } />

        {/* Admin-Only Routes */}
        <Route path="/admin-dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />

        {/* Parent-Only Routes */}
        <Route path="/parent-portal" element={
          <ParentRoute>
            <ParentPortal />
          </ParentRoute>
        } />

        {/* Multi-Role Routes */}
        <Route path="/community" element={
          <ProtectedRoute>
            <Community />
          </ProtectedRoute>
        } />

        <Route path="/community/new-discussion" element={
          <ProtectedRoute>
            <NewDiscussion />
          </ProtectedRoute>
        } />

        <Route path="/live-classes" element={
          <ProtectedRoute>
            <LiveClassesPage />
          </ProtectedRoute>
        } />

        <Route path="/live-classes/:id" element={
          <ProtectedRoute>
            <LiveClassDetailPage />
          </ProtectedRoute>
        } />

        <Route path="/live-classes/:id/video" element={
          <ProtectedRoute>
            <LiveClassVideoRoom />
          </ProtectedRoute>
        } />

        <Route path="/recorded-classes" element={
          <ProtectedRoute>
            <div>
              <Navbar />
              <RecordedClasses />
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

        <Route path="/pricing" element={
          <ProtectedRoute>
            <div>
              <Navbar />
              <PremiumPage />
              <Footer />
            </div>
          </ProtectedRoute>
        } />

        {/* Access Denied Route */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

      </Routes>
    </AuthProvider>
  );
}

export default App;