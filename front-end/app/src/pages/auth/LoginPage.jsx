// Login Page
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/common/Layout/AuthLayout';
import { LoginForm } from '../../components/auth/LoginForm/LoginForm';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (data) => {
    try {
      setLoading(true);
      const credentials = {
        email: data.email,
        password: data.password,
      };
      await login(credentials);
    } catch (error) {
      showError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Sign In" 
      subtitle=""
      showInfoPanel={true}
      infoTitle="WELCOME BACK"
      infoText="Access your TradeEase account to manage orders, track shipments, handle complaints, and enjoy seamless customer service. Sign in to continue your experience."
      alternateRoute="/register"
      alternateButtonText="Create Account"
    >
      <LoginForm onSubmit={handleLogin} loading={loading} />
    </AuthLayout>
  );
};
