// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../admin/dashboard/hooks/AuthContext';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // or spinner

  return user ? children : <Navigate to="/login" replace />;
}
