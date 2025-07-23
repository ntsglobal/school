import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import firebaseAuth from "../../services/firebaseAuth";

const year = new Date().getFullYear();

const Login = () => {
  const [role, setRole] = useState("student");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    localStorage.setItem("userRole", selectedRole); // Save role for backend use
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const loginData = {
        ...formData,
        role: role
      };
      
      await login(loginData);
      navigate("/onboarding/step1"); // Redirect to onboarding after successful login
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);

    try {
      // Sign in with Google using Firebase
      const firebaseUser = await firebaseAuth.signInWithGoogle();
      
      // Get Firebase ID token
      const firebaseToken = await firebaseUser.getIdToken();

      // Send Firebase token to our backend for login
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseToken: firebaseToken,
          email: firebaseUser.email
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Save user data and redirect
        localStorage.setItem('userData', JSON.stringify(data.data.user));
        localStorage.setItem('authToken', data.data.token);
        navigate("/onboarding/step1");
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      // If user doesn't exist, redirect to signup
      if (err.message?.includes('User not found') || err.message?.includes('not found')) {
        setError("No account found. Redirecting to sign up...");
        setTimeout(() => navigate("/signup"), 2000);
      } else {
        setError(err.message || "Google sign-in failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setError("");
    setIsLoading(true);

    try {
      // Sign in with Facebook using Firebase
      const firebaseUser = await firebaseAuth.signInWithFacebook();
      
      // Get Firebase ID token
      const firebaseToken = await firebaseUser.getIdToken();

      // Send token to our backend for verification and user data
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseToken: firebaseToken
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store user data and token
        localStorage.setItem('userData', JSON.stringify(data.data.user));
        localStorage.setItem('authToken', data.data.token);
        
        // Navigate to appropriate dashboard
        const userRole = data.data.user.role;
        if (userRole === 'student') {
          navigate("/student-dashboard");
        } else if (userRole === 'parent') {
          navigate("/parent-portal");
        } else {
          navigate("/"); // Default navigation
        }
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Facebook sign-in error:', err);
      
      // Handle specific Facebook auth errors
      if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with the same email address but different sign-in credentials. Please use the original sign-in method.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (err.message?.includes('User not found') || err.message?.includes('not found')) {
        setError("No account found. Redirecting to sign up...");
        setTimeout(() => navigate("/signup"), 2000);
      } else {
        setError(err.message || "Facebook sign-in failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
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
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <HiOutlineMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <HiOutlineLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-1">
                  <input 
                    type="checkbox" 
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="form-checkbox" 
                  /> 
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-blue-500 hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="my-4 flex items-center">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-2 text-gray-400">or continue with</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            <button 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-md hover:bg-gray-50 gap-2 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FcGoogle className="text-xl" /> 
              {isLoading ? "Signing in..." : "Sign in with Google"}
            </button>

            <button 
              onClick={handleFacebookSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-md hover:bg-blue-50 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaFacebook className="text-blue-600 text-xl" /> 
              {isLoading ? "Signing in..." : "Sign in with Facebook"}
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
