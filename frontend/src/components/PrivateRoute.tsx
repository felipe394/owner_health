import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, redirectTo = '/login' }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
