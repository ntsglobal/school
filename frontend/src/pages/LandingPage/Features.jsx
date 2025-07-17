import React from "react";

function Features() {
  const features = [
    {
      icon: "/images/icons/gamepad.png", 
      title: "Gamified Learning",
      desc: "Learn languages through engaging games and challenges.",
    },
    {
      icon: "/images/icons/robot.png",
      title: "AI-Powered Lab",
      desc: "Personalized learning path adapted to your progress.",
    },
    {
      icon: "/images/icons/analytics.png",
      title: "Real-Time Progress",
      desc: "Track your improvement with detailed analytics.",
    },
  ];

  return (
    <section className="py-16 bg-white px-4">
      <h2 className="text-3xl font-bold text-center mb-4">
        Why Choose NTS Green School ?
      </h2>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {features.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 p-6 rounded-lg hover:border-green-500 hover:shadow-md transition duration-300"
          >
            <div className="mb-4">
              <img
                src={item.icon}
                alt={`${item.title} icon`}
                className="w-10 h-10"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;
