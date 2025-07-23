import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaClock } from "react-icons/fa";

const learningGoals = [
  {
    time: "5 min",
    title: "Quick & Fun",
    description: "Perfect for busy schedules",
    color: "border-red-400 text-red-500",
    key: "quick"
  },
  {
    time: "10 min",
    title: "Steady Progress",
    description: "Balanced learning pace",
    color: "border-yellow-500 text-yellow-500",
    key: "steady"
  },
  {
    time: "15+ min",
    title: "Power Learner",
    description: "Maximum learning impact",
    color: "border-green-600 text-green-600",
    key: "power"
  }
];

const OnBoardingScreen3 = () => {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState(null);

  const handleConfirm = () => {
    if (!selectedGoal) return;
    // Save to localStorage
    const data = JSON.parse(localStorage.getItem("onboardingData")) || {};
    data.learningGoal = selectedGoal;
    localStorage.setItem("onboardingData", JSON.stringify(data));

    // Go to home or dashboard or success page
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white px-6 md:px-12 py-10">
      {/* Step Bar */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-green-600 text-sm">Step 3 of 3</p>
        <div className="flex gap-2">
          <div className="w-8 h-2 bg-green-600 rounded-full"></div>
          <div className="w-8 h-2 bg-green-600 rounded-full"></div>
          <div className="w-8 h-2 bg-green-600 rounded-full"></div>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl md:text-3xl font-bold text-green-700 text-center mb-1">
        Set Your Daily Learning Goal
      </h2>
      <p className="text-center text-gray-600 mb-10">
        Choose your daily commitment to learning
      </p>

      {/* Goal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
        {learningGoals.map((goal) => (
          <div
            key={goal.key}
            onClick={() => setSelectedGoal(goal.key)}
            className={`cursor-pointer border rounded-lg p-6 text-center shadow-sm transition-all duration-200 ${
              selectedGoal === goal.key
                ? `${goal.color} border-2`
                : "border-green-300"
            }`}
          >
            <FaClock className={`mx-auto mb-2 text-2xl ${goal.color}`} />
            <p className="text-green-700 text-lg font-semibold mb-1">{goal.time}</p>
            <p className="font-medium text-sm mb-1">{goal.title}</p>
            <p className="text-gray-500 text-sm">{goal.description}</p>
          </div>
        ))}
      </div>

      {/* Progress Bar Text */}
      <p className="text-center font-medium mb-2">
        Stay consistent and watch your fluency grow!
      </p>
      <div className="w-full max-w-lg h-3 mx-auto bg-gray-200 rounded-full overflow-hidden mb-2">
        <div className="h-full bg-gradient-to-r from-yellow-400 to-green-600 w-2/3"></div>
      </div>
      <p className="text-center text-sm text-gray-500 mb-10">
        Join 10,000+ learners achieving their goals
      </p>

      {/* Confirm Button */}
      <div className="text-center">
        <button
          onClick={handleConfirm}
          disabled={!selectedGoal}
          className={`px-6 py-2 rounded text-white font-medium transition duration-200 ${
            selectedGoal ? "bg-green-600 hover:bg-green-700" : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Confirm Your Daily Goal
        </button>
        <p className="text-xs text-gray-500 mt-2">
          You can always adjust your goal later
        </p>
      </div>
    </div>
  );
};

export default OnBoardingScreen3;