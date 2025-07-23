// src/pages/ForgotPassword.jsx
import React from "react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white border-2 border-green-600 rounded-2xl shadow-sm">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/images/NTS_Green_School.png" // ⬅️ Replace with your actual image path
            alt="Password Reset"
            className="w-12 h-12"
          />
          <h2 className="mt-4 text-xl font-semibold text-gray-800">
            Forgot Your Password?
          </h2>
          <p className="text-sm text-gray-600 text-center mt-2">
            Enter your email address and we'll send you instructions to reset
            your password.
          </p>
        </div>

        <form className="space-y-4 relative">
          <div className="relative">
            <label
              htmlFor="email"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <img
              src="/images/icons/envelope.png"
              alt="Email Icon"
              className="absolute left-3 top-[38px] w-4 h-4"
            />

            <input
              type="email"
              id="email"
              placeholder="Enter your email address"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-green-700 hover:bg-green-800 text-white rounded-md text-sm transition-colors"
          >
            Send Reset Link
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            to="/login"
            className="text-sm text-gray-500 hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
