// Reset Password Form Component
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { useForm } from 'react-hook-form';
import { validators } from '../../../utils/validators';

export const ResetPasswordForm = ({ onSubmit, loading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const {
    register,
    handleSubmit,
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

  const getStrengthColor = () => {
    if (!passwordStrength) return 'default';
    if (passwordStrength.score >= 4) return 'success';
    if (passwordStrength.score >= 3) return 'info';
    if (passwordStrength.score >= 2) return 'warning';
    return 'error';
  };

  const getStrengthValue = () => {
    if (!passwordStrength) return 0;
    return (passwordStrength.score / 5) * 100;
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1, width: '100%' }}>
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="New Password"
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="new-password"
        autoFocus
        error={!!errors.password}
        helperText={errors.password?.message}
        {...register('password', {
          required: 'Password is required',
          validate: validators.password,
        })}
        onChange={handlePasswordChange}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {passwordStrength && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={getStrengthValue()}
            color={getStrengthColor()}
          />
          <Typography variant="caption" color="text.secondary">
            {passwordStrength.feedback}
          </Typography>
        </Box>
      )}
      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Confirm New Password"
        type={showPassword ? 'text' : 'password'}
        id="confirmPassword"
        autoComplete="new-password"
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        {...register('confirmPassword', {
          required: 'Please confirm your password',
          validate: (value) => value === password || 'Passwords do not match',
        })}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? 'Resetting Password...' : 'Reset Password'}
      </Button>
    </Box>
  );
};
