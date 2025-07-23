import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const OnBoardingScreen1 = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [warning, setWarning] = useState("");

  const handleContinue = () => {
    if (selectedLanguage && selectedClass) {
      const userData = {
        language: selectedLanguage,
        class: selectedClass,
      };
      localStorage.setItem("onboardingData", JSON.stringify(userData));
      navigate("/onboarding/step2");
    } else {
      setWarning("Please select both a language and a class before continuing.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white px-6 md:px-12 py-10">
      {/* Step Progress Bar */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-green-600 text-sm">Step 1 of 3</p>
        <div className="flex gap-2">
          <div className="w-8 h-2 bg-green-600 rounded-full"></div>
          <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
          <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto flex flex-col">
        <h2 className="text-2xl md:text-3xl font-bold text-green-700 text-center mb-1">
          Choose Your Learning Journey
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Select a language and grade level to begin your adventure
        </p>

        {/* Language Selection */}
        <h3 className="font-semibold text-md mb-2">
          🌐 Which language would you like to learn?
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { lang: "French", msg: "Bonjour!", bg: "bg-green-100", text: "text-green-800" },
            { lang: "Japanese", msg: "こんにちは!", bg: "bg-emerald-200", text: "text-green-900" },
            { lang: "German", msg: "Hallo!", bg: "bg-green-200", text: "text-green-900" },
            { lang: "Spanish", msg: "¡Hola!", bg: "bg-green-300", text: "text-green-900" },
            { lang: "Korean", msg: "안녕하세요", bg: "bg-emerald-300", text: "text-green-900" },
          ].map(({ lang, msg, bg, text }) => (
            <div
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`${bg} ${text} p-4 rounded-md shadow cursor-pointer hover:opacity-90 border-2 ${
                selectedLanguage === lang ? "border-green-700" : "border-transparent"
              }`}
            >
              <div className="font-semibold">{lang}</div>
              <div className="text-sm">{msg}</div>
            </div>
          ))}
        </div>

        {/* Grade Selection */}
        <h3 className="font-semibold text-md mb-2">🎓 Next, tell us your school grade</h3>
        <div className="flex justify-center flex-wrap gap-3 mb-6">
          {[6, 7, 8, 9, 10].map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedClass(grade)}
              className={`px-5 py-2 rounded-full border ${
                selectedClass === grade
                  ? "bg-green-600 text-white"
                  : "border-green-500 text-green-600 hover:bg-green-100"
              }`}
            >
              Class {grade}
            </button>
          ))}
        </div>

        {/* Tip Box */}
        <div className="bg-green-100 text-green-800 text-sm p-4 rounded mb-6">
          💡 Tip: Choose the language you're most interested in. You can always add more languages later!
        </div>

        {/* Warning Message */}
        {warning && (
          <p className="text-red-500 text-sm text-center mb-4">{warning}</p>
        )}

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            className={`px-6 py-2 rounded transition ${
              selectedLanguage && selectedClass
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!selectedLanguage || !selectedClass}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnBoardingScreen1;
