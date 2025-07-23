import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import authService from '../../services/authService';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setError('');
    setMessage('');
    setIsLoading(true);

    // Basic validation
    if (!email) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.forgotPassword(email);
      
      if (result.success) {
        setEmailSent(true);
        setMessage('Password reset email sent! Please check your inbox and follow the instructions.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="success-icon">
            <FaCheckCircle />
          </div>
          <h1>Check Your Email</h1>
          <p className="success-message">
            We've sent password reset instructions to <strong>{email}</strong>
          </p>
          <div className="email-instructions">
            <h3>What's next?</h3>
            <ol>
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the reset link in the email</li>
              <li>Follow the instructions to create a new password</li>
              <li>Sign in with your new password</li>
            </ol>
          </div>
          <div className="form-actions">
            <Link to="/login" className="back-to-login">
              <FaArrowLeft />
              Back to Login
            </Link>
            <button 
              onClick={() => {
                setEmailSent(false);
                setEmail('');
                setMessage('');
                setError('');
              }}
              className="try-again-btn"
            >
              Try Another Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="form-header">
          <Link to="/login" className="back-link">
            <FaArrowLeft />
          </Link>
          <h1>Reset Your Password</h1>
          <p>Enter your email address and we'll send you instructions to reset your password.</p>
        </div>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="input-group">
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className={error ? 'error' : ''}
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading || !email}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Sending...
              </>
            ) : (
              'Send Reset Instructions'
            )}
          </button>
        </form>

        <div className="form-footer">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="login-link">
              Sign in here
            </Link>
          </p>
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="signup-link">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
