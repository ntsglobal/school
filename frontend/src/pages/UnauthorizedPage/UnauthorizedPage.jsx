import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  const handleGoToDashboard = () => {
    if (hasRole('student')) {
      navigate('/student-dashboard');
    } else if (hasRole('teacher')) {
      navigate('/teacher-dashboard');
    } else if (hasRole('admin')) {
      navigate('/admin-dashboard');
    } else if (hasRole('parent')) {
      navigate('/parent-portal');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full">
            <svg 
              className="w-12 h-12 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          {user && (
            <p className="text-sm text-gray-500">
              Your account role: <span className="font-medium capitalize">{user.role}</span>
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleGoToDashboard}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Go to My Dashboard
          </button>
          
          <Link
            to="/"
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Back to Home
          </Link>
          
          <button
            onClick={() => navigate(-1)}
            className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors duration-200"
          >
            Go Back
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Need help?</strong> If you believe you should have access to this page, 
            please contact your administrator or{' '}
            <Link to="/help-center" className="underline hover:no-underline">
              visit our help center
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
