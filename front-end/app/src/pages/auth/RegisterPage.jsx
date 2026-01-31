// Register Page
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/common/Layout/AuthLayout';
import { RegisterForm } from '../../components/auth/RegisterForm/RegisterForm';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (data) => {
    try {
      setLoading(true);
      // Transform data to match backend API expectations
      const registrationData = {
        email: data.email,
        password: data.password,
        fullName: `${data.firstName} ${data.lastName}`,
        contactNumber: data.phone,
      };
      await registerUser(registrationData);
      showSuccess('Registration successful! Please sign in.');
      navigate('/login');
    } catch (error) {
      showError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Register Form" 
      subtitle=""
      showInfoPanel={true}
      infoTitle="INFORMATION"
      infoText="Join TradeEase to manage your orders, track complaints, and enjoy seamless customer service. Create your account in just a few steps and start experiencing professional trade management."
      alternateRoute="/login"
      alternateButtonText="Have An Account"
    >
      <RegisterForm onSubmit={handleRegister} loading={loading} />
    </AuthLayout>
  );
};
