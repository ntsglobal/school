// src/pages/AboutUsPage/About.import React from 'react';
import { FaBookOpen, FaBrain, FaTrophy, FaTwitter, FaLinkedinIn, FaChartBar, FaGlobe, FaClipboardCheck } from 'react-icons/fa';

// --- Import your logo here ---
// Adjust the path based on where About.jsx is relative to your assets folder
// Assuming src/pages/AboutUsPage/About.jsx and src/assets/logo.svg,
// you need to go up two directories (..) then into assets/
//import PartnerLogo from '../../assets/logo.svg'; 

// --- Placeholder Data ---
const leadershipData = [
  {
    name: 'Sarah Johnson',
    title: 'Founder & CEO',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop', // Example image URL
    social: {
      twitter: '#', // Replace with actual Twitter link
      linkedin: '#', // Replace with actual LinkedIn link
    },
  },
  {
    name: 'Michael Chen',
    title: 'Head of Curriculum',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop', // Example image URL
    social: {
      twitter: '#',
      linkedin: '#',
    },
  },
  {
    name: 'Emily Williams',
    title: 'Lead Instructor',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&h=256&auto=format&fit=crop', // Example image URL
    social: {
      twitter: '#',
      linkedin: '#',
    },
  },
];

const curriculumFeatures = [
  {
    icon: <FaBookOpen size={32} className="text-pink-500" />,
    title: 'Stable-Wise Progression',
    description: 'Our curriculum is designed to ensure a steady and comprehensive learning journey.'
  },
  {
    icon: <FaBrain size={32} className="text-blue-500" />,
    title: 'Skill Development',
    description: 'We focus on practical skills that are applicable in real-world scenarios.'
  },
  {
    icon: <FaTrophy size={32} className="text-yellow-500" />,
    title: 'Achievement Focused',
    description: 'Our goal-oriented approach helps students achieve tangible results and milestones.'
  }
];

// --- Main Page Component ---
function About() {
  return (
    <div className="bg-white">
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-50 to-white text-center py-20 px-4">
          <div className="max-w-4xl mx-auto"> {/* Ensures content has "space in between two sides" and is centered */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
              Empowering Education for Tomorrow's Leaders
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Transforming learning through innovative curriculum and global partnerships.
            </p>
          </div>
        </section>

        {/* Vision & Mission Section */}
        <section className="py-16">
          <div className="container mx-auto px-6 flex flex-col md:flex-row items-center md:items-start gap-12"> {/* items-center on small, items-start on medium+ to align columns */}
            <div className="md:w-1/2 flex justify-center md:justify-start"> {/* Centered image on small, left on medium+ */}
              <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop" alt="Students collaborating" className="rounded-lg shadow-lg w-full max-w-md md:max-w-none" /> {/* Added max-width to control image size on small screens */}
            </div>
            <div className="md:w-1/2 text-center md:text-left"> {/* Main text block aligned left on medium+, centered on small */}
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Vision & Mission</h2>
              <p className="text-gray-600 mb-6">
                We are committed to providing accessible, high-quality education that empowers students to succeed in a globalized world. Our mission is to foster a community of lifelong learners and future leaders.
              </p>
              <div className="grid grid-cols-2 gap-6"> {/* Removed text-center here to allow individual cells to align as needed */}
                <div className="bg-green-50 p-4 rounded-lg text-left"> {/* Explicitly left-aligned text within stat boxes */}
                  <p className="text-3xl font-bold text-green-700">50K+</p>
                  <p className="text-gray-600">Students Enrolled</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-left"> {/* Explicitly left-aligned text within stat boxes */}
                  <p className="text-3xl font-bold text-green-700">100+</p>
                  <p className="text-gray-600">Expert Teachers</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-left"> {/* Explicitly left-aligned text within stat boxes */}
                  <p className="text-3xl font-bold text-green-700">95%</p>
                  <p className="text-gray-600">Success Rate</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-left"> {/* Explicitly left-aligned text within stat boxes */}
                  <p className="text-3xl font-bold text-green-700">50+</p>
                  <p className="text-gray-600">Global Partners</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CEFR-Aligned Curriculum Section */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-10">CEFR-Aligned Curriculum</h2>
            <div className="grid md:grid-cols-3 gap-10">
              {curriculumFeatures.map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center"> {/* Content within feature cards is centered */}
                  <div className="bg-white p-4 rounded-full shadow-md mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Educational Partners Section */}
        <section className="py-16">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Our Educational Partners</h2>
            <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8">
              {/* Use the imported PartnerLogo variable here */}
              <img src={PartnerLogo} alt="Partner Logo 1" className="h-12 filter grayscale hover:grayscale-0 transition-all duration-300" />
              <img src={PartnerLogo} alt="Partner Logo 2" className="h-12 filter grayscale hover:grayscale-0 transition-all duration-300" />
              <img src={PartnerLogo} alt="Partner Logo 3" className="h-12 filter grayscale hover:grayscale-0 transition-all duration-300" />
              <img src={PartnerLogo} alt="Partner Logo 4" className="h-12 filter grayscale hover:grayscale-0 transition-all duration-300" />
            </div>
          </div>
        </section>

        {/* Leadership Section */}
        <section className="bg-gradient-to-b from-green-50 to-white py-16">
          <div className="container mx-auto px-6 text-center"> {/* Centered heading and grid */}
            <h2 className="text-3xl font-bold text-gray-800 mb-12">Meet Our Leadership</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {leadershipData.map((member, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 transition transform hover:-translate-y-2 text-center"> {/* Explicitly centered content within card */}
                  <img src={member.image} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-green-200" />
                  <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
                  <p className="text-gray-500 mb-4">{member.title}</p>
                  <div className="flex justify-center gap-4 text-gray-600"> {/* Social icons centered */}
                    <a href={member.social.twitter} className="hover:text-green-600 transition-colors duration-200"><FaTwitter size={20} /></a>
                    <a href={member.social.linkedin} className="hover:text-green-600 transition-colors duration-200"><FaLinkedinIn size={20} /></a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Educational Value Section */}
        <section className="py-16">
            <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"> {/* items-center for vertical alignment of the two main columns */}
                <div className="space-y-8 text-center lg:text-left"> {/* Text aligned centered on small, left on large */}
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Educational Value</h2>
                    
                    {/* Proven Results */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start"> {/* Flexible layout for icon + text */}
                        <FaChartBar className="text-blue-600 text-3xl sm:mr-4 flex-shrink-0 mb-2 sm:mb-0" />
                        <div className="text-center sm:text-left"> {/* Text block itself aligns responsively */}
                            <h3 className="text-xl font-semibold text-gray-800 mb-1">Proven Results</h3>
                            <p className="text-gray-600">Consistently high success rates in international assessments</p>
                        </div>
                    </div>

                    {/* Global Perspective */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start">
                        <FaGlobe className="text-blue-600 text-3xl sm:mr-4 flex-shrink-0 mb-2 sm:mb-0" />
                        <div className="text-center sm:text-left">
                            <h3 className="text-xl font-semibold text-gray-800 mb-1">Global Perspective</h3>
                            <p className="text-gray-600">International curriculum aligned with global standards</p>
                        </div>
                    </div>

                    {/* Quality Assurance */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start">
                        <FaClipboardCheck className="text-blue-600 text-3xl sm:mr-4 flex-shrink-0 mb-2 sm:mb-0" />
                        <div className="text-center sm:text-left">
                            <h3 className="text-xl font-semibold text-gray-800 mb-1">Quality Assurance</h3>
                            <p className="text-gray-600">Regular quality checks and continuous improvement</p>
                        </div>
                    </div>
                </div>

                {/* Right-hand side statistics box */}
                <div className="bg-white p-8 rounded-lg shadow-lg grid grid-cols-2 gap-8 text-center border border-gray-100">
                    <div>
                        <p className="text-5xl font-bold text-blue-600 mb-2">98%</p>
                        <p className="text-gray-600 text-lg">Student Satisfaction</p>
                    </div>
                    <div>
                        <p className="text-5xl font-bold text-blue-600 mb-2">100%</p>
                        <p className="text-gray-600 text-lg">Certification Rate</p>
                    </div>
                    <div>
                        <p className="text-5xl font-bold text-blue-600 mb-2">24/7</p>
                        <p className="text-gray-600 text-lg">Support Available</p>
                    </div>
                    <div>
                        <p className="text-5xl font-bold text-blue-600 mb-2">50+</p>
                        <p className="text-gray-600 text-lg">Countries Reached</p>
                    </div>
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-green-600 to-teal-500 text-white">
          <div className="container mx-auto px-6 py-16 text-center">
            <h2 className="text-4xl font-bold mb-4">Join Our Educational Journey</h2>
            <p className="text-lg mb-8">Start learning with NTS Green School today and unlock your potential.</p>
            <button className="bg-yellow-400 text-gray-800 px-8 py-3 rounded-md font-bold hover:bg-yellow-300 transition-colors duration-200 text-lg shadow">
              Join Now
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default About;