import React from "react";
import { useNavigate } from "react-router-dom";

function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-r from-[#2F855A] to-[#3B82F6] text-white py-12 px-4 text-center">
      <h2 className="text-lg font-semibold mb-4">
        Ready to Start Your Language Journey?
      </h2>
      <div className="flex justify-center gap-4 flex-wrap">
        <button
          onClick={() => navigate("/signup")}
          className="bg-yellow-400 text-white px-6 py-2 rounded-full font-medium hover:bg-yellow-500"
        >
          Join Now
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="border border-white text-white px-6 py-2 rounded-full font-medium hover:bg-white hover:text-teal-600 transition"
        >
          Try Demo
        </button>
      </div>
    </section>
  );
}

export default FinalCTA;
