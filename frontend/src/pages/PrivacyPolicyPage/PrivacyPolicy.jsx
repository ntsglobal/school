import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="bg-white px-6 md:px-20 py-10 text-gray-800 font-sans">
      <h1 className="text-2xl font-bold mb-1">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-6">Last Updated: February 15, 2025</p>
      <p className="mb-6">
        Welcome to NTS Green School’s Privacy Policy. This policy describes how we collect, use, and protect your personal information when you use our educational platform.
      </p>

      <Section title="1. Information We Collect" content={[
        "Student information (name, age, grade level)",
        "Parent/guardian contact details",
        "Academic progress and performance data",
        "Language learning preferences and progress",
        "Device and usage information"
      ]} />

      <Section title="2. How We Use Your Information" content={[
        "Provide personalized language learning experiences",
        "Track and assess student progress",
        "Communicate with parents/guardians",
        "Improve our educational content and services",
        "Ensure platform security and performance"
      ]} />

      <Section title="3. Data Protection for Students" content={[
        "Special protections for users under 18",
        "Limited data collection from young users",
        "Parental consent requirements",
        "Educational data privacy compliance"
      ]} />

      <Section title="4. Security Measures" content={[
        "End-to-end encryption for sensitive data",
        "Regular security audits and updates",
        "Secure data storage and transmission",
        "Access controls and authentication"
      ]} />

      <Section title="5. Your Rights and Choices" content={[
        "Access your personal information",
        "Request data correction or deletion",
        "Opt-out of marketing communications",
        "Manage privacy settings"
      ]} />

      <div className="mt-10 border-t pt-6">
        <h2 className="text-lg font-semibold mb-4">Contact Us</h2>
        <div className="text-sm space-y-2">
          <p>Email: <a href="mailto:privacy@ntsgreenschool.com" className="text-blue-600 hover:underline">privacy@ntsgreenschool.com</a></p>
          <p>Phone: +91-XXX-XXX-XXXX</p>
          <p>Address: 123 Education Street, Knowledge Park, New Delhi, India 110001</p>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, content }) => (
  <div className="mb-8">
    <h2 className="text-base font-semibold text-green-700 mb-2">{title}</h2>
    <div className="bg-green-100 rounded p-4 text-sm">
      <ul className="list-disc list-inside space-y-1">
        {content.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  </div>
);

export default PrivacyPolicy;
