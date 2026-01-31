// Reset Password Page
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../../components/common/Layout/AuthLayout';
import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm/ResetPasswordForm';
import { authAPI } from '../../api/auth.api';
import { useToast } from '../../contexts/ToastContext';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token');

  const handleResetPassword = async (data) => {
    if (!token) {
      showError('Invalid or missing reset token.');
      return;
    }

    try {
      setLoading(true);
      await authAPI.resetPassword(token, data.password);
      showSuccess('Password reset successful! Please sign in with your new password.');
      navigate('/login');
    } catch (error) {
      showError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your new password">
      <ResetPasswordForm onSubmit={handleResetPassword} loading={loading} />
    </AuthLayout>
  );
};
