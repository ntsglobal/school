import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardRedirect = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  if (user?.role === 'user') {
    // User needs to complete onboarding
    return <Navigate to="/role-selection" replace />;
  } else if (user?.role === 'student') {
    return <Navigate to="/student-dashboard" replace />;
  } else if (user?.role === 'teacher') {
    return <Navigate to="/teacher-dashboard" replace />;
  } else if (user?.role === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  } else if (user?.role === 'parent') {
    return <Navigate to="/parent-portal" replace />;
  }

  // Default fallback to home if role is not recognized
  return <Navigate to="/" replace />;
};

export default DashboardRedirect;
