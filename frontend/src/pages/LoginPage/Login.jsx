import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";

const year = new Date().getFullYear();

const Login = () => {
  const [role, setRole] = useState("student");

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    localStorage.setItem("userRole", selectedRole); // Save role for backend use
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-white text-gray-800 font-sans">
      <div className="w-full max-w-6xl bg-white flex shadow rounded-lg overflow-hidden">
        {/* Left Section */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-green-300 via-blue-100 to-blue-300 p-8">
          <img
            src="/images/classroom.png"
            alt="Classroom"
            className="rounded-lg mb-4"
          />
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
            Begin Your Multilingual Journey
          </h2>
          <span className="bg-blue-200 text-blue-900 text-xs px-3 py-1 rounded-full">
            NEP 2020 Aligned Curriculum
          </span>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 p-8">
          {/* Top Logo & Language */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <img
                src="/images/NTS_Green_School.png"
                alt="Logo"
                className="h-6 rounded-md"
              />
              <span className="ml-2 font-semibold text-green-700 text-lg">
                NTS Green School
              </span>
            </div>

            {/* Language Dropdown with PNG */}
            <div className="relative">
              <select className="appearance-none border border-gray-300 rounded px-2 py-1 text-sm pr-6">
                <option value="en">English</option>
                {/* You can add more language codes here */}
              </select>
              <img
                src="/images/icons/globe.png" // Your PNG globe or flag
                alt="Lang"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
              />
            </div>
          </div>

          {/* Role Switcher */}
          <div className="flex gap-4 mb-4">
            {[
              { label: "Student", key: "student" },
              { label: "Parent", key: "parent" },
              { label: "Teacher", key: "teacher" },
            ].map((r) => (
              <button
                key={r.key}
                onClick={() => handleRoleChange(r.key)}
                className={`px-4 py-2 rounded-md font-medium border ${
                  role === r.key
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Welcome Back</h2>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <HiOutlineMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <HiOutlineLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="flex justify-between items-center mt-2 text-sm">
              <label className="flex items-center gap-1">
                <input type="checkbox" className="form-checkbox" /> Remember me
              </label>
              <a href="/forgot-password" className="text-blue-500 hover:underline">
                Forgot Password?
              </a>
            </div>

            <button className="mt-4 w-full py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700">
              Sign In
            </button>

            <div className="my-4 flex items-center">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-2 text-gray-400">or continue with</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            <button className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-md hover:bg-gray-50 gap-2">
              <FcGoogle className="text-xl" /> Sign in with Google
            </button>

            <p className="text-center text-sm text-gray-600 mt-6">
              New to NTS Green School?{" "}
              <a href="/signup" className="text-green-600 font-medium hover:underline">
                Create Account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div> 
  );
};

export default Login;
