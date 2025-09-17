import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      &lt;div className="min-h-screen flex items-center justify-center"&gt;
        &lt;div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"&gt;&lt;/div&gt;
      &lt;/div&gt;
    );
  }

  if (!isAuthenticated) {
    return &lt;Navigate to="/login" state={{ from: location }} replace /&gt;;
  }

  if (adminOnly && !isAdmin) {
    return &lt;Navigate to="/unauthorized" replace /&gt;;
  }

  return children;
};

export default ProtectedRoute;