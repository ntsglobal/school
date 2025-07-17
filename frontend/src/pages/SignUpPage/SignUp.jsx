import React, { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

// Role selection icons from src/assets
import studentBlack from "../../assets/icons/student-black.png";
import studentWhite from "../../assets/icons/student-white.png";
import parentBlack from "../../assets/icons/parent-black.png";
import parentWhite from "../../assets/icons/parent-white.png";
import teacherBlack from "../../assets/icons/teacher-black.png";
import teacherWhite from "../../assets/icons/teacher-white.png";

const roles = [
  { id: "student", label: "Student", iconBlack: studentBlack, iconWhite: studentWhite },
  { id: "parent", label: "Parent", iconBlack: parentBlack, iconWhite: parentWhite },
  { id: "teacher", label: "Teacher", iconBlack: teacherBlack, iconWhite: teacherWhite }
];

const SignUp = () => {
  const [selectedRole, setSelectedRole] = useState("student");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = { ...formData, role: selectedRole };
    console.log("Submitted Data:", finalData);
    // Send finalData to backend
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex flex-col md:flex-row justify-center items-start md:items-center flex-grow px-4 pt-16 pb-10 gap-10 max-w-7xl mx-auto">
        {/* Left Form Section */}
        <div className="w-full max-w-md">
          <h2 className="text-[#2F855A] text-2xl font-bold mb-1">Join NTS Green School</h2>
          <p className="text-gray-600 mb-6">Start your educational journey with us</p>

          {/* Role Selection */}
          <div className="flex gap-2 mb-6">
            {roles.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md border font-semibold text-sm transition ${
                    isSelected
                      ? "bg-[#2F855A] text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <img
                    src={isSelected ? role.iconWhite : role.iconBlack}
                    alt={role.label}
                    className="h-5 w-5"
                  />
                  {role.label}
                </button>
              );
            })}
          </div>

          {/* Form Box */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-[#2F855A] font-semibold text-lg mb-4">Create Your Account</h3>

            <form onSubmit={handleSubmit}>
              <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-1/2 border rounded px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-1/2 border rounded px-3 py-2 text-sm"
                />
              </div>

              <input
                type="email"
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 text-sm mb-4"
              />

              <input
                type="text"
                name="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 text-sm mb-4"
              />

              <input
                type="password"
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 text-sm mb-4"
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 text-sm mb-6"
              />

              <button
                type="submit"
                className="w-full bg-[#2F855A] text-white py-2 rounded font-semibold mb-4"
              >
                Sign Up
              </button>
            </form>

            <div className="text-center text-sm text-gray-500 mb-4">or</div>

            <button className="w-full flex items-center justify-center gap-2 border rounded py-2 text-sm font-medium mb-3">
              <FcGoogle className="text-lg" /> Sign up with Google
            </button>

            <p className="text-sm text-center mt-4">
              Already have an account?{" "}
              <a href="/login" className="text-red-500 font-medium">
                Log In
              </a>
            </p>
          </div>
        </div>

        {/* Right Info Section */}
        <div className="bg-blue-50 rounded-xl p-6 w-full max-w-md">
          <h4 className="text-[#2F855A] font-semibold text-lg mb-4">
            Why Choose NTS Green School?
          </h4>

          <ul className="space-y-4 text-left text-sm text-gray-700 mb-6">
            <li className="flex items-start gap-3">
              <img src="/images/icons/graduation-cap.png" alt="Education" className="h-5 w-5 mt-1" />
              <div>
                <strong>Quality Education</strong>
                <br />
                Excellence in teaching and learning
              </div>
            </li>
            <li className="flex items-start gap-3">
              <img src="/images/icons/book.png" alt="Curriculum" className="h-5 w-5 mt-1" />
              <div>
                <strong>Modern Curriculum</strong>
                <br />
                Updated and comprehensive programs
              </div>
            </li>
            <li className="flex items-start gap-3">
              <img src="/images/icons/community.png" alt="Community" className="h-5 w-5 mt-1" />
              <div>
                <strong>Supportive Community</strong>
                <br />
                Strong network of students and teachers
              </div>
            </li>
            <li className="flex items-start gap-3">
              <img src="/images/icons/faculty.png" alt="Faculty" className="h-5 w-5 mt-1" />
              <div>
                <strong>Expert Faculty</strong>
                <br />
                Highly qualified and experienced teachers
              </div>
            </li>
          </ul>

          <div className="bg-white rounded-lg p-4 shadow">
            <h5 className="text-sm font-semibold mb-2">Additional Benefits</h5>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-[#2F855A]" /> Free study materials
              </li>
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-[#2F855A]" /> Regular assessments
              </li>
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-[#2F855A]" /> Career guidance
              </li>
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-[#2F855A]" /> Parent-teacher meetings
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
