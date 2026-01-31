// Dashboard Router - Routes to Admin or Customer dashboard based on user role
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AdminDashboardPage } from './AdminDashboard';
import { DashboardPage as CustomerDashboardPage } from './CustomerDashboard';

export const DashboardRouter = () => {
  const { isAdmin } = useAuth();

  return isAdmin ? <AdminDashboardPage /> : <CustomerDashboardPage />;
};
