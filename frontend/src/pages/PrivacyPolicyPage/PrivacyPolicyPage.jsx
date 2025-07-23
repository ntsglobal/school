import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './PrivacyPolicyPage.css';

const PrivacyPolicyPage = () => {
  return (
    <div className="privacy-policy-page">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last Updated: February 15, 2024</p>

        <p className="mb-6">
          Welcome to NTS Green School's Privacy Policy. This policy describes how we collect, use, and protect your personal information when you use our educational platform.
        </p>

        <div className="policy-section">
          <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
          <p className="mb-4">We collect information to provide and improve our educational services. This includes:</p>
          <ul className="list-disc list-inside">
            <li>Student information (name, age, grade level)</li>
            <li>Parent/guardian contact details</li>
            <li>Academic progress and performance data</li>
            <li>Language learning preferences and progress</li>
            <li>Device and usage information</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">We use your information to:</p>
          <ul className="list-disc list-inside">
            <li>Provide personalized language learning experiences</li>
            <li>Track and assess student progress</li>
            <li>Communicate with parents/guardians</li>
            <li>Improve our educational content and services</li>
            <li>Ensure platform security and performance</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2 className="text-2xl font-bold mb-4">3. Data Protection for Students</h2>
          <p className="mb-4">We implement special protections for student data:</p>
          <ul className="list-disc list-inside">
            <li>Special protections for users under 18</li>
            <li>Limited data collection from young users</li>
            <li>Parental consent requirements</li>
            <li>Educational data privacy compliance</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2 className="text-2xl font-bold mb-4">4. Security Measures</h2>
          <p className="mb-4">We use industry-standard security measures to protect your data:</p>
          <ul className="list-disc list-inside">
            <li>End-to-end encryption for sensitive data</li>
            <li>Regular security audits and updates</li>
            <li>Secure data storage and transmission</li>
            <li>Access controls and authentication</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2 className="text-2xl font-bold mb-4">5. Your Rights and Choices</h2>
          <p className="mb-4">You have the following rights regarding your data:</p>
          <ul className="list-disc list-inside">
            <li>Access your personal information</li>
            <li>Request data correction or deletion</li>
            <li>Opt-out of marketing communications</li>
            <li>Manage privacy settings</li>
          </ul>
        </div>

        <div className="contact-section">
          <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
          <div className="flex items-center mb-2">
            <svg className="w-6 h-6 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            <a href="mailto:privacy@ntsgreenschool.com" className="text-blue-500">privacy@ntsgreenschool.com</a>
          </div>
          <div className="flex items-center mb-2">
            <svg className="w-6 h-6 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            <span>+91-XXX-XXX-XXXX</span>
          </div>
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span>123 Education Street, Knowledge Park, New Delhi, India 110001</span>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
