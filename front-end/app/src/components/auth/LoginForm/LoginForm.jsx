// Login Form Component
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import { validators } from '../../../utils/validators';

export const LoginForm = ({ onSubmit, loading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const loadAdminCredentials = () => {
    setValue('email', 'jtdhamodharan@gmail.com');
    setValue('password', 'Madurai54321!');
  };

  const loadCustomerCredentials = () => {
    setValue('email', 'iomega.azure@gmail.com');
    setValue('password', 'Madurai54321!');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Demo Credentials */}
      <div className="mb-3 text-center">
        <div className="btn-list justify-content-center">
          <button
            type="button"
            className="btn btn-icon btn-outline-primary"
            onClick={loadAdminCredentials}
            title="Admin Demo Login"
          >
            <i className="ti ti-shield-lock"></i>
          </button>
          <button
            type="button"
            className="btn btn-icon btn-outline-secondary"
            onClick={loadCustomerCredentials}
            title="Customer Demo Login"
          >
            <i className="ti ti-user"></i>
          </button>
        </div>
        <small className="text-muted d-block mt-2">Click icons for demo credentials</small>
      </div>

      {/* Email Field */}
      <div className="mb-3">
        <label className="form-label required" htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
          placeholder="john.doe@example.com"
          autoComplete="email"
          autoFocus
          aria-required="true"
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email', {
            required: 'Email is required',
            validate: validators.email,
          })}
        />
        {errors.email && (
          <div id="email-error" className="invalid-feedback" role="alert">{errors.email.message}</div>
        )}
      </div>

      {/* Password Field */}
      <div className="mb-3">
        <label className="form-label required" htmlFor="password">Password</label>
        <div className="input-group">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            placeholder="••••••••"
            autoComplete="current-password"
            aria-required="true"
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password', {
              required: 'Password is required',
            })}
          />
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={handleClickShowPassword}
            title={showPassword ? 'Hide password' : 'Show password'}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <i className={showPassword ? 'ti ti-eye-off' : 'ti ti-eye'}></i>
          </button>
          {errors.password && (
            <div id="password-error" className="invalid-feedback" role="alert">{errors.password.message}</div>
          )}
        </div>
      </div>
      
      {/* Remember Me & Forgot Password */}
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <label className="form-check">
          <input type="checkbox" className="form-check-input" {...register('rememberMe')} />
          <span className="form-check-label">Remember me</span>
        </label>
        <RouterLink to="/forgot-password" className="link-primary">
          Forgot password?
        </RouterLink>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="btn btn-primary w-100"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2"></span>
            Signing In...
          </>
        ) : (
          'Sign In'
        )}
      </button>

      {/* Sign Up Link */}
      <div className="text-center text-muted mt-3">
        Don't have an account?{' '}
        <RouterLink to="/register" className="link-primary">
          Sign Up
        </RouterLink>
      </div>
    </form>
  );
};
