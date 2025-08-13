import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import bgImage from "/images/bgImage.png";

function Hero() {
  const navigate = useNavigate();
  const { isAuthenticated, user, hasRole } = useAuth();

  // Handle language selection based on authentication status
  const handleLanguageSelect = (languageName) => {
    if (isAuthenticated) {
      // For authenticated users, navigate to appropriate dashboard or language selection
      if (user?.role === 'user') {
        // User needs to complete onboarding
        navigate('/role-selection');
      } else {
        // Navigate to language selection or courses
        navigate('/language-selection');
      }
    } else {
      // For guests, navigate to signup
      if (languageName === "Explore Others") {
        navigate("/signup");
      } else {
        navigate(`/signup/${languageName.toLowerCase()}`);
      }
    }
  };

  // Handle start journey button based on authentication status
  const handleStartJourney = () => {
    if (isAuthenticated) {
      // User is logged in, redirect to appropriate dashboard
      if (user?.role === 'user') {
        // User needs to complete onboarding
        navigate('/role-selection');
      } else if (hasRole('student')) {
        navigate('/student-dashboard');
      } else if (hasRole('teacher')) {
        navigate('/teacher-dashboard');
      } else if (hasRole('admin')) {
        navigate('/admin-dashboard');
      } else if (hasRole('parent')) {
        navigate('/parent-portal');
      } else {
        // Fallback to dashboard redirect
        navigate('/dashboard');
      }
    } else {
      // User is not logged in, go to signup
      navigate('/signup');
    }
  };

  const languages = [
    { name: "French", icon: "/images/icons/french.png" },
    { name: "Japanese", icon: "/images/icons/japanese.png" },
    { name: "German", icon: "/images/icons/german.png" },
    { name: "Korean", icon: "/images/icons/korean.png" },
    { name: "Spanish", icon: "/images/icons/spanish.png" },
    { name: "Explore Others", icon: "/images/icons/globe.png" },
  ];

  const features = [
    { name: "Stories", icon: "/images/icons/stories.png" },
    { name: "Games", icon: "/images/icons/games.png" },
    { name: "Conversations", icon: "/images/icons/conversations.png" },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Full‑cover sliding background */}
      <div
        className="absolute inset-0 z-0 bg-repeat-x bg-center bg-cover animate-slide"
        style={{
          backgroundImage: `url(${bgImage})`,
          animation: "slide 60s linear infinite",
        }}
      />

      {/* Tinted + blurred overlay */}
      <div className="absolute inset-0 z-10 bg-green-50/65 backdrop-blur-sm" />

      {/* Main content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4">
        <img
          src="/images/NTS_Green_School.png"
          alt="NTS Green School Logo"
          className="w-12 h-12 md:w-16 md:h-16 mb-3 rounded-full"
        />


        <h1 className="text-3xl md:text-5xl font-bold text-black mb-1">
          NTS Green School
        </h1>
        <h2 className="text-lg md:text-2xl font-semibold text-green-700">
          Master Languages through Interactive Learning
        </h2>
        <p className="text-sm md:text-base text-gray-800 mt-2 mb-6">
          AI-Powered Platform making language learning Engaging and Effective!
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {languages.map((lang) => (
            <div
              key={lang.name}
              className="flex flex-col items-center gap-1 w-[70px] cursor-pointer"
              onClick={() => handleLanguageSelect(lang.name)}
            >
              <div className="w-14 h-14 rounded-full bg-white shadow flex items-center justify-center overflow-hidden">
                <img
                  src={lang.icon}
                  alt={`${lang.name} icon`}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-xs font-medium text-gray-800">
                {lang.name}
              </span>
            </div>
          ))}
        </div>



        {/* Smart navigation button based on authentication status */}
        <button
          onClick={handleStartJourney}
          className="px-6 py-3 bg-green-700 text-white rounded-full font-bold shadow-md hover:brightness-110 transition"
        >
          {isAuthenticated ? "Continue Learning" : "Start Your Journey"}
        </button>
        <p className="text-xs text-gray-700 mt-2">
          {isAuthenticated 
            ? "Access your personalized dashboard" 
            : "Tap to begin your multilingual mastery"
          }
        </p>
      </div>
    </div>
  );
}

export default Hero;
