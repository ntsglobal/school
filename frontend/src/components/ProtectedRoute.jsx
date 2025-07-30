import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredRoles = [], 
  requireEmailVerification = false,
  requirePremium = false 
}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    hasRole, 
    hasAnyRole, 
    isEmailVerified, 
    hasPremiumSubscription 
  } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for specific role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check for any of the required roles
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check for email verification requirement
  if (requireEmailVerification && !isEmailVerified()) {
    return <Navigate to="/verify-email" replace />;
  }

  // Check for premium subscription requirement
  if (requirePremium && !hasPremiumSubscription()) {
    return <Navigate to="/upgrade" replace />;
  }

  // All checks passed, render the protected component
  return children;
};

// Higher-order component for role-based protection
export const withRoleProtection = (Component, requiredRole) => {
  return (props) => (
    <ProtectedRoute requiredRole={requiredRole}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Higher-order component for multiple roles protection
export const withRolesProtection = (Component, requiredRoles) => {
  return (props) => (
    <ProtectedRoute requiredRoles={requiredRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Specific role-based route components
export const StudentRoute = ({ children }) => (
  <ProtectedRoute requiredRole="student">
    {children}
  </ProtectedRoute>
);

export const TeacherRoute = ({ children }) => (
  <ProtectedRoute requiredRole="teacher">
    {children}
  </ProtectedRoute>
);

export const ParentRoute = ({ children }) => (
  <ProtectedRoute requiredRole="parent">
    {children}
  </ProtectedRoute>
);

export const AdminRoute = ({ children }) => (
  <ProtectedRoute requiredRole="admin">
    {children}
  </ProtectedRoute>
);

export const TeacherOrAdminRoute = ({ children }) => (
  <ProtectedRoute requiredRoles={['teacher', 'admin']}>
    {children}
  </ProtectedRoute>
);

export const ParentOrAdminRoute = ({ children }) => (
  <ProtectedRoute requiredRoles={['parent', 'admin']}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
