import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Footer from "../../components/Footer"; 

const RoleCard = ({ emoji, title, description, color, borderColor, textColor, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`w-full max-w-2xl cursor-pointer transition-all hover:scale-[1.02] flex items-center justify-between rounded-xl px-6 py-5 mb-4 border-l-4 ${color} ${borderColor}`}
    >
      <div className="text-left">
        <div className="text-lg md:text-xl font-semibold flex items-center gap-2">
          <span className="text-xl">{emoji}</span>{" "}
          <span className={textColor}>{title}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <div className={`text-2xl ${textColor}`}>➔</div>
    </div>
  );
};

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleRoleSelection = (role, signupPath) => {
    if (isAuthenticated && user?.role === 'user') {
      // Existing user completing onboarding
      localStorage.setItem('selectedRole', role);
      navigate('/onboarding/step1');
    } else {
      // New user signup
      navigate(signupPath);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-center">
      {/* Top content */}
      <div className="flex flex-col items-center px-4 pt-24">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {isAuthenticated && user?.role === 'user' 
            ? "Complete Your Profile" 
            : "Who's using the app today?"
          }
        </h1>
        <p className="text-gray-500 mb-8">
          {isAuthenticated && user?.role === 'user'
            ? "Choose your role to get started with personalized features"
            : "Choose your role so we can personalize your experience"
          }
        </p>

        {/* Cards */}
        <RoleCard
          emoji="🎓"
          title="I'm a Student"
          description="I want to learn a new language"
          color="bg-orange-50"
          borderColor="border-orange-400"
          textColor="text-orange-500"
          onClick={() => handleRoleSelection('student', '/signup/student')}
        />

        <RoleCard
          emoji="👨‍👩‍👧"
          title="I'm a Parent"
          description="I want to track my child's progress"
          color="bg-green-50"
          borderColor="border-green-400"
          textColor="text-green-500"
          onClick={() => handleRoleSelection('parent', '/signup/parent')}
        />

        <RoleCard
          emoji="👩‍🏫"
          title="I'm a Teacher"
          description="I want to manage my language classes"
          color="bg-red-50"
          borderColor="border-red-400"
          textColor="text-red-500"
          onClick={() => handleRoleSelection('teacher', '/signup/teacher')}
        />

        {/* Help line */}
        <div className="mt-10 mb-6">
          <p className="text-sm">
            Need help?{" "}
            <a href="/support" className="text-green-600 underline">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;