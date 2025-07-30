import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './HelpCenter.css';

const HelpCenter = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Help Center Categories
  const categories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      description: 'Learn the basics of our platform',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'course-materials',
      title: 'Course Materials',
      icon: '📚',
      description: 'Access and manage your courses',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'technical-support',
      title: 'Technical Support',
      icon: '🔧',
      description: 'Resolve technical issues',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'account-billing',
      title: 'Account & Billing',
      icon: '💳',
      description: 'Manage your account and payments',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'language-programs',
      title: 'Language Programs',
      icon: '🌍',
      description: 'Learn about our language courses',
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'study-progress',
      title: 'Study Progress',
      icon: '📊',
      description: 'Track your learning journey',
      color: 'bg-indigo-100 text-indigo-800'
    },
    {
      id: 'parent-guide',
      title: 'Parents Guide',
      icon: '👨‍👩‍👧‍👦',
      description: 'Guide for parents and guardians',
      color: 'bg-pink-100 text-pink-800'
    },
    {
      id: 'certifications',
      title: 'Certifications',
      icon: '🏆',
      description: 'Certificates and achievements',
      color: 'bg-orange-100 text-orange-800'
    }
  ];

  // Popular Topics
  const popularTopics = [
    {
      id: 1,
      title: 'How to start your first Japanese lesson',
      category: 'Getting Started',
      views: 1234,
      helpful: 98
    },
    {
      id: 2,
      title: 'Tracking your learning progress',
      category: 'Study Progress',
      views: 987,
      helpful: 95
    },
    {
      id: 3,
      title: 'Setting homework guidelines for parents',
      category: 'Parents Guide',
      views: 756,
      helpful: 92
    },
    {
      id: 4,
      title: 'Payment methods and billing',
      category: 'Account & Billing',
      views: 654,
      helpful: 89
    },
    {
      id: 5,
      title: 'Accessing video recordings',
      category: 'Course Materials',
      views: 543,
      helpful: 94
    },
    {
      id: 6,
      title: 'Parent certificate and enrollment',
      category: 'Certifications',
      views: 432,
      helpful: 91
    }
  ];

  // Frequently Asked Questions
  const faqs = [
    {
      id: 1,
      question: 'You can reset your password by clicking on the "Forgot Password" link on the login page',
      answer: 'To reset your password, go to the login page and click on "Forgot Password". Enter your email address and we will send you a reset link. Follow the instructions in the email to create a new password.',
      category: 'Account & Billing'
    },
    {
      id: 2,
      question: 'We accept all major credit cards, PayPal, and bank transfers',
      answer: 'We accept Visa, Mastercard, American Express, Discover, PayPal, and direct bank transfers. All payments are processed securely through our encrypted payment system.',
      category: 'Account & Billing'
    },
    {
      id: 3,
      question: 'Can I access homework resources for my child?',
      answer: 'Yes, parents can access their child\'s homework assignments, progress reports, and additional study materials through the Parent Portal. Log in to your parent account to view all resources.',
      category: 'Parents Guide'
    },
    {
      id: 4,
      question: 'How do I track my progress?',
      answer: 'Your progress is automatically tracked as you complete lessons and activities. You can view detailed progress reports in your dashboard, including completed lessons, quiz scores, and time spent studying.',
      category: 'Study Progress'
    },
    {
      id: 5,
      question: 'Your progress is automatically saved and can be viewed in your dashboard',
      answer: 'All your learning progress is saved automatically. You can access comprehensive progress reports, including lesson completion rates, quiz scores, study time, and achievement badges from your student dashboard.',
      category: 'Study Progress'
    },
    {
      id: 6,
      question: 'How do I access resources?',
      answer: 'Course resources including videos, documents, and interactive materials can be accessed from your course dashboard. Click on any course to view all available materials and resources.',
      category: 'Course Materials'
    }
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    // Simulate search API call
    setTimeout(() => {
      const results = [
        ...popularTopics.filter(topic => 
          topic.title.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        ...faqs.filter(faq => 
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
      ];
      setSearchResults(results);
      setLoading(false);
    }, 500);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    // You could navigate to a detailed category page or filter content
    // For now, we'll just highlight the selected category
  };

  const handleTopicClick = (topic) => {
    // Navigate to detailed article page
    // navigate(`/help/article/${topic.id}`);
    console.log('Navigate to:', topic.title);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="bg-gradient-to-b from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl mb-8 text-blue-100">
            How can we help you today?
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 text-gray-900 bg-white rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Results</h2>
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="font-semibold text-gray-900 mb-2">{result.title || result.question}</h3>
                  <p className="text-gray-600 text-sm mb-2">{result.answer || `Views: ${result.views}`}</p>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {result.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={`bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-all cursor-pointer ${
                  selectedCategory?.id === category.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{category.title}</h3>
                  <p className="text-gray-600 text-sm">{category.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Topics */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTopics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => handleTopicClick(topic)}
                className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
              >
                <h3 className="font-semibold text-gray-900 mb-3">{topic.title}</h3>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">{topic.category}</span>
                  <div className="flex items-center space-x-4">
                    <span>{topic.views} views</span>
                    <span className="text-green-600">{topic.helpful}% helpful</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <FAQItem key={faq.id} faq={faq} />
            ))}
          </div>
        </div>

        {/* Still Need Help? */}
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Email Support */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-blue-600 text-3xl mb-3">📧</div>
              <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 text-sm mb-4">
                Get in touch and we'll get back to you within 24 hours
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Send Email
              </button>
            </div>

            {/* Live Chat */}
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="text-green-600 text-3xl mb-3">💬</div>
              <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600 text-sm mb-4">
                Chat with our support team in real-time
              </p>
              <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                Start Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// FAQ Item Component
const FAQItem = ({ faq }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h3 className="font-semibold text-gray-900">{faq.question}</h3>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-4">
          <p className="text-gray-600">{faq.answer}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {faq.category}
            </span>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <button className="hover:text-green-600 transition-colors">
                👍 Helpful
              </button>
              <button className="hover:text-red-600 transition-colors">
                👎 Not helpful
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpCenter;
