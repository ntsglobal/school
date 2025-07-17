import React from "react";

function SuccessStories() {
  const stories = [
    {
      name: "Sarah Johnson",
      image: "/images/users/portrait.jpeg",
      stars: 5,
      message: "Spoke French fluently in 6 months",
    },
    {
      name: "Michael Chen",
      image: "/images/users/portrait.jpeg",
      stars: 5,
      message: "Mastered Japanese business terms",
    },
    {
      name: "Emma Wilson",
      image: "/images/users/portrait.jpeg",
      stars: 5,
      message: "Spanish certification achieved",
    },
  ];

  return (
    <section className="py-12 bg-white px-4 text-center">
      <h2 className="text-2xl font-bold mb-6">Success Stories</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {stories.map((story, i) => (
          <div key={i} className="border rounded-lg p-4 text-left hover:border-green-500 hover:shadow-md transition duration-300">
            <div className="flex items-center gap-3 mb-2">
              <img src={story.image} alt={story.name} className="w-10 h-10 rounded-full" />
              <div>
                <h4 className="font-semibold">{story.name}</h4>
                <div className="text-yellow-500 text-sm">★★★★★</div>
              </div>
            </div>
            <p className="text-sm text-gray-600">{story.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SuccessStories;
