import React from "react";
import { useNavigate } from "react-router-dom";

function AvailableLanguages() {
  const navigate = useNavigate();

  const languages = [
    { name: "French", level: "Beginner Friendly", icon: "/images/icons/french.png" },
    { name: "Japanese", level: "Intermediate", icon: "/images/icons/japanese.png" },
    { name: "Spanish", level: "Beginner Friendly", icon: "/images/icons/spanish.png" },
    { name: "German", level: "Intermediate", icon: "/images/icons/german.png" },
    { name: "Chinese", level: "Advanced", icon: "/images/icons/chinese.png" },
    { name: "Italian", level: "Beginner Friendly", icon: "/images/icons/italian.png" },
    { name: "Korean", level: "Intermediate", icon: "/images/icons/korean.png" },
    { name: "Russian", level: "Advanced", icon: "/images/icons/russian.png" },
  ];

  return (
    <section className="py-12 bg-white px-4 text-center">
      <h2 className="text-2xl font-bold mb-6">Available Languages</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {languages.map((lang) => (
          <div
            key={lang.name}
            className="border rounded-lg p-4 text-left hover:border-green-500 hover:shadow-md transition duration-300"
          >
            <div className="flex items-center gap-3 mb-2">
              <img src={lang.icon} alt={lang.name} className="w-6 h-6" />
              <h3 className="font-semibold text-gray-800">{lang.name}</h3>
            </div>
            <p className="text-sm text-gray-600">{lang.level}</p>
            <button
              onClick={() => navigate("/signup")}
              className="mt-3 bg-green-700 text-white text-sm px-3 py-1 rounded-full hover:bg-green-800"
            >
              Start Learning
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AvailableLanguages;
