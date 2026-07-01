// src/components/PrivateRoute.js
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../admin/dashboard/hooks/AuthContext';

interface PrivateRouteProps {
  children: ReactNode;
}

interface AuthContextType {
  user: unknown;
  loading: boolean;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, loading } = useAuth() as AuthContextType;

  if (loading) return <div>Loading...</div>; // or spinner

  return user ? children : <Navigate to="/login" replace />;
}
