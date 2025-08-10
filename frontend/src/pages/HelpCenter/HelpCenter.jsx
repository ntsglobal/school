import React from "react";
import { Search, BookOpen, Settings, User, Globe, BarChart2, Users, Award, Mail, MessageCircle } from "lucide-react";

export default function HelpCenter() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-green-100 to-white text-center py-12">
        <h1 className="text-3xl font-bold">Help Center</h1>
        <p className="mt-2 text-gray-600">
          Find answers to your questions about language learning
        </p>
        <div className="mt-6 max-w-lg mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help"
              className="w-full border rounded-lg py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <Search className="absolute right-3 top-3 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-4 py-10">
        {[
          { icon: <BookOpen size={28} />, title: "Getting Started" },
          { icon: <BookOpen size={28} />, title: "Course Materials" },
          { icon: <Settings size={28} />, title: "Technical Support" },
          { icon: <User size={28} />, title: "Account & Billing" },
          { icon: <Globe size={28} />, title: "Language Programs" },
          { icon: <BarChart2 size={28} />, title: "Study Progress" },
          { icon: <Users size={28} />, title: "Parents Guide" },
          { icon: <Award size={28} />, title: "Certifications" },
        ].map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center bg-gray-50 p-6 rounded-lg hover:shadow-md transition"
          >
            <div className="text-blue-600 mb-3">{item.icon}</div>
            <p className="font-medium">{item.title}</p>
          </div>
        ))}
      </div>

      {/* Popular Topics */}
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-lg font-semibold mb-4">Popular Topics</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: "How to start your first language lesson" },
            { title: "Tracking your learning progress" },
            { title: "Switching between languages" },
            { title: "Payment methods and plans" },
            { title: "Accessing study materials" },
            { title: "Parent controls and monitoring" },
          ].map((topic, i) => (
            <div
              key={i}
              className="border border-green-200 rounded-lg p-4 hover:shadow-sm transition"
            >
              <p className="text-green-600 font-medium">{topic.title}</p>
              <p className="text-gray-500 text-sm mt-1">
                Learn how to get the most out of your language learning journey.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 mt-10 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg font-semibold mb-6">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                q: "How do I reset my password?",
                a: "You can reset your password by clicking on the 'Forgot Password' link on the login page.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and UPI for Indian users.",
              },
              {
                q: "Can I switch between different languages?",
                a: "Yes, you can switch between languages at any time in your learning dashboard.",
              },
              {
                q: "How do I track my progress?",
                a: "Your progress is automatically tracked and displayed in your dashboard.",
              },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-lg p-5 shadow-sm">
                <p className="text-green-600 font-medium">{faq.q}</p>
                <p className="text-gray-500 text-sm mt-1">{faq.a}</p>
                <a href="#" className="text-blue-500 text-sm mt-2 inline-block">
                  Read more
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Still Need Help */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-lg font-semibold mb-6">Still need help?</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-red-300 rounded-lg p-5 flex items-start space-x-4">
            <Mail className="text-red-500 mt-1" size={24} />
            <div>
              <p className="font-medium">Email Support</p>
              <p className="text-gray-500 text-sm">
                support@ntsgreenschool.com
              </p>
              <p className="text-gray-400 text-sm">Response within 24 hours</p>
            </div>
          </div>
          <div className="border border-yellow-300 rounded-lg p-5 flex items-start space-x-4">
            <MessageCircle className="text-yellow-500 mt-1" size={24} />
            <div>
              <p className="font-medium">Live Chat</p>
              <p className="text-gray-500 text-sm">Available 9 AM - 6 PM IST</p>
              <p className="text-gray-400 text-sm">
                Get instant help from our support team
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
