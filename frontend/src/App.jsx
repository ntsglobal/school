import React from 'react';
import { Routes, Route } from 'react-router-dom';
import "@fortawesome/fontawesome-free/css/all.min.css";

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './pages/LandingPage/Hero';
import Features from './pages/LandingPage/Features';
import Login from './pages/LoginPage/Login';
import SignUp from './pages/SignUpPage/SignUp'; 
import ForgotPassword from './pages/ForgotPasswordPage/ForgotPassword.jsx';
import RoleSelectionPage from './pages/RoleSelection/RoleSelectionPage'; 
import OnBoardingScreen1 from './pages/OnBoardingPage/OnBoardingScreen1'; 
import OnBoardingScreen2 from './pages/OnBoardingPage/OnBoardingScreen2'; 
import OnBoardingScreen3 from './pages/OnBoardingPage/OnBoardingScreen3'; 
import LandingPage from './pages/LandingPage/LandingPage.jsx';
import Contact from './pages/ContactPage/Contact.jsx';
import About from './pages/AboutPage/About.jsx';
import PrivacyPolicy from './pages/PrivacyPolicyPage/PrivacyPolicy';


function App() {
  return (
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
          </div>} />

        {/* Login/Register Page Route */}
        <Route path="/login" element={
          <div>
            <Navbar />
            <Login />
            <Footer />
          </div>} />

        {/* Sign In Page Route */}
        <Route path="/signup" element={ 
          <div>
            <Navbar />
            <SignUp />
            <Footer />
          </div>} />

        {/* Forgot Password Page Route */} 
        <Route path="/forgot-password" element={
          <div>
          <Navbar />
          <ForgotPassword />
          <Footer />
          </div>} />

        {/* Onboarding Page  */}
        <Route path="/onboarding/step1" element={
          <div>
          <Navbar />
          <OnBoardingScreen1 />
          <Footer />
          </div>} />
        <Route path="/onboarding/step2" element={
          <div>
          <Navbar />
          <OnBoardingScreen2 />
          <Footer />
          </div>} />
        <Route path="/onboarding/step3" element={
          <div>
          <Navbar />
          <OnBoardingScreen3 />
          <Footer />
          </div>} />

        {/* Contact Page */}
        <Route path="/contact" element={
          <div>
            <Navbar />
            <Contact />
            <Footer />
          </div>} />
        
        <Route path="/about" element={
          <div>
            <Navbar />
            <About />
            <Footer />
          </div>} />

        <Route path="/privacy-policy" element={
          <div>
            <Navbar />
            <PrivacyPolicy />
            <Footer />
          </div>} />
      </Routes>

      
  );
}

export default App;