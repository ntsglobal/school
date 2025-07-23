import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import firebaseAuthService from '../../services/firebaseAuth';
import './ResetPassword.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');

  useEffect(() => {
    if (!oobCode || mode !== 'resetPassword') {
      setError('Invalid or missing reset link. Please request a new password reset.');
      setVerifyingCode(false);
      return;
    }

    // Verify the reset code
    const verifyCode = async () => {
      try {
        const auth = firebaseAuthService.auth;
        const userEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(userEmail);
        setVerifyingCode(false);
      } catch (error) {
        console.error('Reset code verification error:', error);
        if (error.code === 'auth/invalid-action-code') {
          setError('This password reset link is invalid or has expired. Please request a new one.');
        } else if (error.code === 'auth/expired-action-code') {
          setError('This password reset link has expired. Please request a new one.');
        } else {
          setError('An error occurred verifying the reset link. Please try again.');
        }
        setVerifyingCode(false);
      }
    };

    verifyCode();
  }, [oobCode, mode]);

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return 'Password must be at least 8 characters long';
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!hasLowerCase) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!hasNumbers) {
      return 'Password must contain at least one number';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    setIsLoading(true);

    // Validate passwords
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const auth = firebaseAuthService.auth;
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
    } catch (error) {
      console.error('Password reset error:', error);
      
      if (error.code === 'auth/invalid-action-code') {
        setError('This password reset link is invalid or has expired. Please request a new one.');
      } else if (error.code === 'auth/expired-action-code') {
        setError('This password reset link has expired. Please request a new one.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else {
        setError('An error occurred while resetting your password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (verifyingCode) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="loading-state">
            <div className="spinner-large"></div>
            <h2>Verifying Reset Link</h2>
            <p>Please wait while we verify your password reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !email) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2>Invalid Reset Link</h2>
            <p className="error-message">{error}</p>
            <div className="error-actions">
              <Link to="/forgot-password" className="primary-btn">
                Request New Reset Link
              </Link>
              <Link to="/login" className="secondary-btn">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="success-state">
            <div className="success-icon">
              <FaCheckCircle />
            </div>
            <h2>Password Reset Successful!</h2>
            <p>Your password has been successfully reset.</p>
            <div className="success-actions">
              <button 
                onClick={() => navigate('/login')}
                className="primary-btn"
              >
                Sign In Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score <= 2) return { level: score, text: 'Weak', color: '#ef4444' };
    if (score <= 3) return { level: score, text: 'Fair', color: '#f59e0b' };
    if (score <= 4) return { level: score, text: 'Good', color: '#3b82f6' };
    return { level: score, text: 'Strong', color: '#10b981' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="form-header">
          <h1>Reset Your Password</h1>
          <p>Enter a new password for <strong>{email}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="input-group">
            <label htmlFor="password">New Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className={error && error.includes('Password') ? 'error' : ''}
                disabled={isLoading}
                autoFocus
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill"
                    style={{ 
                      width: `${(passwordStrength.level / 5) * 100}%`,
                      backgroundColor: passwordStrength.color
                    }}
                  ></div>
                </div>
                <span 
                  className="strength-text"
                  style={{ color: passwordStrength.color }}
                >
                  {passwordStrength.text}
                </span>
              </div>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className={error && error.includes('match') ? 'error' : ''}
                disabled={isLoading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="password-requirements">
            <h4>Password Requirements:</h4>
            <ul>
              <li className={password.length >= 8 ? 'valid' : ''}>
                At least 8 characters long
              </li>
              <li className={/[A-Z]/.test(password) ? 'valid' : ''}>
                One uppercase letter
              </li>
              <li className={/[a-z]/.test(password) ? 'valid' : ''}>
                One lowercase letter
              </li>
              <li className={/\d/.test(password) ? 'valid' : ''}>
                One number
              </li>
              <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'valid' : ''}>
                One special character
              </li>
            </ul>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading || !password || !confirmPassword}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="form-footer">
          <Link to="/login" className="back-link">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
