// Register Form Component
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import { validators } from '../../../utils/validators';

export const RegisterForm = ({ onSubmit, loading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    if (pwd) {
      const strength = validators.checkPasswordStrength(pwd);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  };

  const generatePassword = () => {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let generatedPassword = '';
    
    // Ensure at least one of each required character type
    generatedPassword += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    generatedPassword += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    generatedPassword += '0123456789'[Math.floor(Math.random() * 10)];
    generatedPassword += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    
    for (let i = generatedPassword.length; i < length; i++) {
      generatedPassword += charset[Math.floor(Math.random() * charset.length)];
    }
    
    generatedPassword = generatedPassword.split('').sort(() => Math.random() - 0.5).join('');
    
    setValue('password', generatedPassword);
    setValue('confirmPassword', generatedPassword);
    
    const strength = validators.checkPasswordStrength(generatedPassword);
    setPasswordStrength(strength);
  };

  const loadTestData = () => {
    setValue('firstName', 'Ramkumar');
    setValue('lastName', 'JD');
    setValue('email', 'piwayop997@ixunbo.com');
    setValue('phone', '9886098860');
    setValue('agreeToTerms', true);
  };

  const getStrengthColor = () => {
    if (!passwordStrength) return 'secondary';
    if (passwordStrength.score >= 5) return 'success';
    if (passwordStrength.score >= 4) return 'info';
    if (passwordStrength.score >= 2) return 'warning';
    return 'danger';
  };

  const getStrengthValue = () => {
    if (!passwordStrength) return 0;
    return (passwordStrength.score / 6) * 100;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Test Data Loader */}
      <div className="mb-3 d-flex justify-content-end">
        <button
          type="button"
          className="btn btn-sm btn-outline-warning btn-icon"
          onClick={loadTestData}
          title="Load Test Data (Dev Only)"
        >
          <i className="ti ti-bug"></i>
        </button>
      </div>

      {/* Personal Information */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label required">First Name</label>
          <input
            type="text"
            className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
            placeholder="John"
            autoComplete="given-name"
            autoFocus
            {...register('firstName', {
              required: 'First name is required',
              minLength: { value: 2, message: 'Minimum 2 characters' },
            })}
          />
          {errors.firstName && (
            <div className="invalid-feedback">{errors.firstName.message}</div>
          )}
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label required">Last Name</label>
          <input
            type="text"
            className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
            placeholder="Doe"
            autoComplete="family-name"
            {...register('lastName', {
              required: 'Last name is required',
              minLength: { value: 2, message: 'Minimum 2 characters' },
            })}
          />
          {errors.lastName && (
            <div className="invalid-feedback">{errors.lastName.message}</div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label required">Email Address</label>
          <input
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            placeholder="john.doe@example.com"
            autoComplete="email"
            {...register('email', {
              required: 'Email is required',
              validate: validators.email,
            })}
          />
          {errors.email && (
            <div className="invalid-feedback">{errors.email.message}</div>
          )}
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label required">Phone Number</label>
          <input
            type="tel"
            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
            placeholder="9876543210"
            autoComplete="tel"
            {...register('phone', {
              required: 'Phone number is required',
              validate: validators.phone,
            })}
          />
          {errors.phone && (
            <div className="invalid-feedback">{errors.phone.message}</div>
          )}
        </div>
      </div>

      {/* Password Fields */}
      <div className="mb-2">
        <label className="form-label required">Password</label>
        <div className="input-group">
          <input
            type={showPassword ? 'text' : 'password'}
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            placeholder="••••••••"
            autoComplete="new-password"
            {...register('password', {
              required: 'Password is required',
              validate: validators.password,
            })}
            onChange={handlePasswordChange}
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={generatePassword}
            title="Generate Strong Password"
          >
            <i className="ti ti-refresh"></i>
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleClickShowPassword}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            <i className={showPassword ? 'ti ti-eye-off' : 'ti ti-eye'}></i>
          </button>
          {errors.password && (
            <div className="invalid-feedback">{errors.password.message}</div>
          )}
        </div>
      </div>

      {/* Password Strength Indicator */}
      {passwordStrength && (
        <div className="mb-3">
          <div className="progress" style={{ height: '6px' }}>
            <div
              className={`progress-bar bg-${getStrengthColor()}`}
              role="progressbar"
              style={{ width: `${getStrengthValue()}%` }}
              aria-valuenow={getStrengthValue()}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
          <small className="text-muted d-block mt-1">{passwordStrength.feedback}</small>
        </div>
      )}

      <div className="mb-3">
        <label className="form-label required">Confirm Password</label>
        <div className="input-group">
          <input
            type={showPassword ? 'text' : 'password'}
            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
            placeholder="••••••••"
            autoComplete="new-password"
            {...register('confirmPassword', {
              required: 'Confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            })}
          />
          {password && watch('confirmPassword') && password === watch('confirmPassword') && (
            <span className="input-group-text bg-success text-white">
              <i className="ti ti-check"></i>
            </span>
          )}
          {errors.confirmPassword && (
            <div className="invalid-feedback">{errors.confirmPassword.message}</div>
          )}
        </div>
      </div>

      {/* Terms Checkbox */}
      <div className="mb-3">
        <label className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            {...register('agreeToTerms', {
              required: 'You must agree to the terms',
            })}
          />
          <span className="form-check-label">
            I agree to the{' '}
            <RouterLink to="/terms" className="link-primary">
              Terms and Conditions
            </RouterLink>
          </span>
        </label>
        {errors.agreeToTerms && (
          <div className="text-danger small mt-1">{errors.agreeToTerms.message}</div>
        )}
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
            Creating Account...
          </>
        ) : (
          'Register'
        )}
      </button>
    </form>
  );
};
