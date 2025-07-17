import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

const levels = [
  {
    id: "A1",
    title: "A1 - Beginner",
    desc: "Just starting out",
    border: "border-yellow-400",
    bg: "bg-yellow-50",
    dot: "bg-yellow-400",
    hover: "hover:bg-yellow-100",
  },
  {
    id: "A2",
    title: "A2 - Elementary",
    desc: "Basic communication",
    border: "border-yellow-500",
    bg: "bg-yellow-50",
    dot: "bg-yellow-500",
    hover: "hover:bg-yellow-100",
  },
  {
    id: "B1",
    title: "B1 - Intermediate",
    desc: "Everyday conversation",
    border: "border-red-400",
    bg: "bg-red-50",
    dot: "bg-red-400",
    hover: "hover:bg-red-100",
  },
];

const OnBoardingScreen2 = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState(null);

  const handleSelect = (levelId) => {
    setSelectedLevel(levelId);
    localStorage.setItem("languageLevel", levelId); // Store for future use
  };

  const handleContinue = () => {
    if (selectedLevel) {
      navigate("/onboarding/step3");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white px-6 md:px-12 py-10">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-green-600 text-sm">Step 2 of 3</p>
        <div className="flex gap-2">
          <div className="w-8 h-2 bg-green-600 rounded-full"></div>
          <div className="w-8 h-2 bg-green-600 rounded-full"></div>
          <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-3xl mx-auto text-center">
        <div className="text-4xl mb-4">🈯</div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Choose Your Language Level
        </h2>
        <p className="text-gray-600 mb-10">
          Select the CEFR level that matches your current language skills
        </p>

        {/* Level Options */}
        <div className="space-y-5 mb-8">
          {levels.map((level) => {
            const isActive = selectedLevel === level.id;
            return (
              <div
                key={level.id}
                onClick={() => handleSelect(level.id)}
                className={`flex justify-between items-center px-5 py-4 rounded-xl shadow-sm cursor-pointer transition ${
                  level.bg
                } ${level.border} ${level.hover} ${
                  isActive ? "ring-2 ring-green-500" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${level.dot}`}></div>
                  <div className="text-left">
                    <div className="font-semibold">{level.title}</div>
                    <div className="text-sm text-gray-600">{level.desc}</div>
                  </div>
                </div>
                <FiChevronRight className="text-gray-400 text-xl" />
              </div>
            );
          })}
        </div>

        <p className="text-gray-500 text-sm mb-8">
          ❓ Not sure? Don’t worry, you can change it later!
        </p>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedLevel}
          className={`px-6 py-2 rounded font-semibold transition ${
            selectedLevel
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-white cursor-not-allowed"
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default OnBoardingScreen2;