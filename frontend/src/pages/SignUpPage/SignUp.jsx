import React, { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import firebaseAuth from "../../services/firebaseAuth";
import Footer from "../../components/Footer";

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "student",
    grade: "",
    board: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      };

      // Add required fields for students
      if (formData.role === 'student') {
        registrationData.grade = parseInt(formData.grade);
        registrationData.board = formData.board;
      }
      
      await register(registrationData);
      navigate("/onboarding/step1"); // Redirect to onboarding after successful registration
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setIsLoading(true);

    try {
      // Use Google sign-in (this works for both existing and new users)
      const firebaseUser = await firebaseAuth.signInWithGoogle();
      
      // Get Firebase ID token
      const firebaseToken = await firebaseUser.getIdToken();

      // First, try to login (check if user exists in our database)
      try {
        const loginResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firebaseToken: firebaseToken
          }),
        });

        const loginData = await loginResponse.json();

        if (loginData.success) {
          // User exists, log them in
          localStorage.setItem('userData', JSON.stringify(loginData.data.user));
          localStorage.setItem('authToken', loginData.data.token);
          navigate("/onboarding/step1");
          return;
        }
      } catch (loginError) {
        // Login failed, user doesn't exist in our database, proceed with registration
        console.log('User not found in database, proceeding with registration');
      }

      // If login failed, register the user in our database
      const [firstName, ...lastNameParts] = firebaseUser.displayName?.split(' ') || ['', ''];
      const lastName = lastNameParts.join(' ') || '';

      const registrationData = {
        firstName: firstName || 'User',
        lastName: lastName || '',
        email: firebaseUser.email,
        phone: '', // Google doesn't provide phone number
        role: 'student', // Default role
        grade: 10, // Default grade for students
        board: 'CBSE', // Default board
        firebaseUid: firebaseUser.uid,
        firebaseToken: firebaseToken
      };

      // Register user in our backend
      await register(registrationData);
      navigate("/onboarding/step1");

    } catch (err) {
      console.error('Google signup error:', err);
      setError(err.message || "Google sign-up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignUp = async () => {
    setError("");
    setIsLoading(true);

    try {
      // Use Facebook sign-in (this works for both existing and new users)
      const firebaseUser = await firebaseAuth.signInWithFacebook();
      
      // Get Firebase ID token
      const firebaseToken = await firebaseUser.getIdToken();

      // First, try to login (check if user exists in our database)
      try {
        const loginResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firebaseToken: firebaseToken
          }),
        });

        const loginData = await loginResponse.json();

        if (loginData.success) {
          // User exists, log them in
          localStorage.setItem('userData', JSON.stringify(loginData.data.user));
          localStorage.setItem('authToken', loginData.data.token);
          navigate("/onboarding/step1");
          return;
        }
      } catch (loginError) {
        // Login failed, user doesn't exist in our database, proceed with registration
        console.log('User not found in database, proceeding with registration');
      }

      // If login failed, register the user in our database
      const [firstName, ...lastNameParts] = firebaseUser.displayName?.split(' ') || ['', ''];
      const lastName = lastNameParts.join(' ') || '';

      const registrationData = {
        firstName: firstName || 'User',
        lastName: lastName || '',
        email: firebaseUser.email,
        phone: '', // Facebook doesn't always provide phone number
        role: 'student', // Default role
        grade: 10, // Default grade for students
        board: 'CBSE', // Default board
        firebaseUid: firebaseUser.uid,
        firebaseToken: firebaseToken
      };

      // Register user in our backend
      await register(registrationData);
      navigate("/onboarding/step1");

    } catch (err) {
      console.error('Facebook signup error:', err);
      
      // Handle specific Facebook auth errors
      if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with the same email address but different sign-in credentials. Please use the original sign-in method.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-up was cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups for this site and try again.');
      } else {
        setError(err.message || "Facebook sign-up failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Main content */}
      <div className="flex flex-col md:flex-row justify-center items-start md:items-center flex-grow px-4 pt-16 pb-10 gap-10 max-w-7xl mx-auto">
        {/* Left Form Section */}
        <div className="w-full max-w-md">
          <h2 className="text-green-600 text-2xl md:text-3xl font-bold mb-1">
            Join NTS Green School
          </h2>
          <p className="text-gray-600 mb-6">Start your multilingual journey with us</p>

          <h3 className="text-orange-500 font-semibold text-lg mb-4">
            Create Your Account
          </h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter first name"
                required
                className="w-1/2 border rounded px-3 py-2 text-sm"
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter last name"
                required
                className="w-1/2 border rounded px-3 py-2 text-sm"
              />
            </div>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              required
              className="w-full border rounded px-3 py-2 text-sm mb-4"
            />

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              required
              className="w-full border rounded px-3 py-2 text-sm mb-4"
            />

            {/* Role Selection */}
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2 text-sm mb-4"
            >
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="teacher">Teacher</option>
            </select>

            {/* Conditional fields for students */}
            {formData.role === 'student' && (
              <>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2 text-sm mb-4"
                >
                  <option value="">Select Grade</option>
                  <option value="6">Grade 6</option>
                  <option value="7">Grade 7</option>
                  <option value="8">Grade 8</option>
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                </select>

                <select
                  name="board"
                  value={formData.board}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2 text-sm mb-4"
                >
                  <option value="">Select Board</option>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="International">International</option>
                  <option value="Other">Other</option>
                </select>
              </>
            )}

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create password"
              required
              minLength="6"
              className="w-full border rounded px-3 py-2 text-sm mb-4"
            />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm password"
              required
              className="w-full border rounded px-3 py-2 text-sm mb-6"
            />

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-2 rounded font-semibold mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="text-center text-sm text-gray-500 mb-4">or</div>

          <button 
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 border rounded py-2 text-sm font-medium mb-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FcGoogle className="text-lg" /> 
            {isLoading ? "Signing up..." : "Sign up with Google"}
          </button>

          <button 
            onClick={handleFacebookSignUp}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 border rounded py-2 text-sm font-medium mb-3 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaFacebook className="text-blue-600 text-lg" /> 
            {isLoading ? "Signing up..." : "Sign up with Facebook"}
          </button>

          <p className="text-sm text-center mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-red-500 font-medium">
              Log in
            </a>
          </p>
        </div>

        {/* Right Benefits Section */}
        <div className="bg-orange-50 rounded-xl p-6 w-full max-w-md">
          <h4 className="text-green-700 font-semibold text-lg mb-4">
            Why Choose NTS Green School?
          </h4>

          <ul className="space-y-3 text-left text-sm text-gray-700 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-orange-500">🎓</span>
              <div>
                <strong>Quality Education</strong>
                <br /> Excellence in teaching and learning
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">📘</span>
              <div>
                <strong>Modern Curriculum</strong>
                <br /> Updated and comprehensive programs
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">🤝</span>
              <div>
                <strong>Supportive Community</strong>
                <br /> Strong network of students and teachers
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">👩‍🏫</span>
              <div>
                <strong>Expert Faculty</strong>
                <br /> Highly qualified and experienced teachers
              </div>
            </li>
          </ul>

          <div className="bg-white rounded-lg p-4 shadow">
            <h5 className="text-sm font-semibold mb-2">Additional Benefits</h5>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500" /> Free study materials
              </li>
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500" /> Regular assessments
              </li>
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500" /> Career guidance
              </li>
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500" /> Parent-teacher meetings
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;