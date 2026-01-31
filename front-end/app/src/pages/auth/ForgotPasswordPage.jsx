// Forgot Password Page
import React, { useState } from 'react';
import { AuthLayout } from '../../components/common/Layout/AuthLayout';
import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm/ForgotPasswordForm';
import { authAPI } from '../../api/auth.api';
import { useToast } from '../../contexts/ToastContext';

export const ForgotPasswordPage = () => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleForgotPassword = async (data) => {
    try {
      setLoading(true);
      await authAPI.forgotPassword(data.email);
      setSuccess(true);
      showSuccess('Password reset instructions sent to your email.');
    } catch (error) {
      showError(error.message || 'Failed to send reset instructions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email to receive reset instructions"
    >
      <ForgotPasswordForm onSubmit={handleForgotPassword} loading={loading} success={success} />
    </AuthLayout>
  );
};
