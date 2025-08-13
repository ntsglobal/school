import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function FinalCTA() {
  const navigate = useNavigate();
  const { isAuthenticated, user, hasRole } = useAuth();

  // Handle CTA button actions based on authentication status
  const handleJoinNow = () => {
    if (isAuthenticated) {
      // User is logged in, redirect to appropriate dashboard
      if (user?.role === 'user') {
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
        navigate('/dashboard');
      }
    } else {
      navigate("/signup");
    }
  };

  const handleTryDemo = () => {
    if (isAuthenticated) {
      // For logged-in users, show them the courses or language lab
      navigate("/courses");
    } else {
      // For guests, still go to signup but could be a demo signup
      navigate("/signup");
    }
  };

  return (
    <section className="bg-gradient-to-r from-[#2F855A] to-[#3B82F6] text-white py-12 px-4 text-center">
      <h2 className="text-lg font-semibold mb-4">
        {isAuthenticated 
          ? "Ready to Continue Your Language Journey?" 
          : "Ready to Start Your Language Journey?"
        }
      </h2>
      <div className="flex justify-center gap-4 flex-wrap">
        <button
          onClick={handleJoinNow}
          className="bg-yellow-400 text-white px-6 py-2 rounded-full font-medium hover:bg-yellow-500"
        >
          {isAuthenticated ? "Go to Dashboard" : "Join Now"}
        </button>
        <button
          onClick={handleTryDemo}
          className="border border-white text-white px-6 py-2 rounded-full font-medium hover:bg-white hover:text-teal-600 transition"
        >
          {isAuthenticated ? "Explore Courses" : "Try Demo"}
        </button>
      </div>
    </section>
  );
}

export default FinalCTA;
