// frontend/src/pages/TermsPage/Terms.jsx
import React from "react";

const Terms = () => {
  return (
    <div className="bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-800">Terms of Service</h1>
        <p className="text-sm text-gray-500 mt-1">Last Updated: July 16, 2025</p>

        {/* Section 1 */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-green-700">1. Introduction</h2>
          <p className="mt-2 text-gray-700">
            Welcome to NTS Green School’s online language learning platform. By accessing
            or using our services, you agree to these terms.
          </p>
        </section>

        {/* Section 2 */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-green-700">2. Service Description</h2>
          <p className="mt-2 text-gray-700">
            NTS Green School provides online language learning services for students grades 6–10, including:
          </p>
          <ul className="list-disc list-inside mt-2 text-gray-700">
            <li>Interactive language courses in Japanese, German, French, Spanish, and Korean</li>
            <li>Curriculum aligned with NEP 2020</li>
            <li>Learning materials and assessments</li>
            <li>Virtual classroom sessions</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-green-700">3. User Accounts</h2>
          <div className="bg-green-50 border border-green-100 rounded-md p-3 mt-2 text-gray-800 text-sm">
            To access our services, users must:
          </div>
          <ul className="list-disc list-inside mt-2 text-gray-700">
            <li>Create an account with accurate information</li>
            <li>Maintain account security</li>
            <li>Be enrolled in grades 6–10</li>
            <li>Have parental consent if under 13</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-green-700">4. Privacy and Data</h2>
          <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3 mt-2 text-gray-800 text-sm">
            We protect your privacy and handle data according to our Privacy Policy, including:
          </div>
          <ul className="list-disc list-inside mt-2 text-gray-700">
            <li>Student information protection</li>
            <li>Learning progress tracking</li>
            <li>Communication records</li>
            <li>Assessment data</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-green-700">5. User Conduct</h2>
          <div className="bg-red-50 border border-red-100 rounded-md p-3 mt-2 text-gray-800 text-sm">
            Users must:
          </div>
          <ul className="list-disc list-inside mt-2 text-gray-700">
            <li>Respect intellectual property rights</li>
            <li>Maintain appropriate behavior</li>
            <li>Not share account credentials</li>
            <li>Not misuse the platform</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-green-700">6. Payment Terms</h2>
          <p className="mt-2 text-gray-700">
            Our subscription plans and payment terms include:
          </p>
          <ul className="list-disc list-inside mt-2 text-gray-700">
            <li>Transparent pricing</li>
            <li>Refund policies</li>
            <li>Payment methods</li>
            <li>Billing cycles</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-green-700">7. Content Usage</h2>
          <div className="bg-green-50 border border-green-100 rounded-md p-3 mt-2 text-gray-800 text-sm">
            All content on NTS Green School platform:
          </div>
          <ul className="list-disc list-inside mt-2 text-gray-700">
            <li>Is protected by copyright</li>
            <li>Is for personal educational use only</li>
            <li>Cannot be redistributed</li>
            <li>Must be properly attributed</li>
          </ul>
        </section>

        {/* Back to Top */}
        <div className="mt-8 text-center">
          <a href="#top" className="text-sm text-blue-600 hover:underline">
            ↑ Back to Top
          </a>
        </div>
      </div>
    </div>
  );
};

export default Terms;
