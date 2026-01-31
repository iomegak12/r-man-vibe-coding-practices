// Edit Profile Page - Update customer profile and change password
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MainLayout } from '../../components/common/Layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { customerAPI } from '../../api/customer.api';
import { authAPI } from '../../api/auth.api';
import { validators } from '../../utils/validators';
import { ROUTES } from '../../utils/constants';

export const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    setValue: setProfileValue,
    formState: { errors: profileErrors },
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch: watchPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm();

  const newPassword = watchPassword('newPassword');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await customerAPI.getMyProfile();
      const customer = response.data.data;
      
      const nameParts = customer.fullName?.split(' ') || ['', ''];
      setProfileValue('firstName', nameParts[0] || '');
      setProfileValue('lastName', nameParts.slice(1).join(' ') || '');
      setProfileValue('email', customer.email || '');
      setProfileValue('contactNumber', customer.contactNumber || '');
      setProfileValue('addressLine1', customer.address?.addressLine1 || '');
      setProfileValue('addressLine2', customer.address?.addressLine2 || '');
      setProfileValue('city', customer.address?.city || '');
      setProfileValue('state', customer.address?.state || '');
      setProfileValue('postalCode', customer.address?.postalCode || '');
      setProfileValue('country', customer.address?.country || '');
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      showError('Failed to load profile data');
    }
  };

  const onSubmitProfile = async (data) => {
    setLoading(true);
    try {
      const profileData = {
        fullName: `${data.firstName} ${data.lastName}`.trim(),
        contactNumber: data.contactNumber,
        address: {
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || '',
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
        },
      };

      await authAPI.updateUserProfile(profileData);
      await updateUserProfile({ fullName: profileData.fullName });
      showSuccess('Profile updated successfully');
      navigate(ROUTES.PROFILE);
    } catch (error) {
      console.error('Profile update error:', error);
      showError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = async (data) => {
    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      showSuccess('Password changed successfully');
      resetPassword();
    } catch (error) {
      console.error('Password change error:', error);
      showError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col">
            <h2 className="page-title">Edit Profile</h2>
            <div className="text-muted mt-1">
              Update your personal information and password
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">Personal Information</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmitProfile(onSubmitProfile)} noValidate>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label required">First Name</label>
                <input
                  type="text"
                  className={`form-control ${profileErrors.firstName ? 'is-invalid' : ''}`}
                  {...registerProfile('firstName', {
                    required: 'First name is required',
                    minLength: { value: 2, message: 'Minimum 2 characters' },
                  })}
                />
                {profileErrors.firstName && (
                  <div className="invalid-feedback">{profileErrors.firstName.message}</div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label required">Last Name</label>
                <input
                  type="text"
                  className={`form-control ${profileErrors.lastName ? 'is-invalid' : ''}`}
                  {...registerProfile('lastName', {
                    required: 'Last name is required',
                    minLength: { value: 2, message: 'Minimum 2 characters' },
                  })}
                />
                {profileErrors.lastName && (
                  <div className="invalid-feedback">{profileErrors.lastName.message}</div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  disabled
                  {...registerProfile('email')}
                />
                <small className="form-hint">Email cannot be changed</small>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Contact Number</label>
                <input
                  type="tel"
                  className={`form-control ${profileErrors.contactNumber ? 'is-invalid' : ''}`}
                  {...registerProfile('contactNumber', {
                    validate: validators.phone,
                  })}
                />
                {profileErrors.contactNumber && (
                  <div className="invalid-feedback">{profileErrors.contactNumber.message}</div>
                )}
              </div>

              <div className="col-12">
                <hr className="my-4" />
                <h4 className="mb-3">Address</h4>
              </div>

              <div className="col-12 mb-3">
                <label className="form-label required">Address Line 1</label>
                <input
                  type="text"
                  className={`form-control ${profileErrors.addressLine1 ? 'is-invalid' : ''}`}
                  {...registerProfile('addressLine1', {
                    required: 'Address is required',
                  })}
                />
                {profileErrors.addressLine1 && (
                  <div className="invalid-feedback">{profileErrors.addressLine1.message}</div>
                )}
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Address Line 2</label>
                <input
                  type="text"
                  className="form-control"
                  {...registerProfile('addressLine2')}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label required">City</label>
                <input
                  type="text"
                  className={`form-control ${profileErrors.city ? 'is-invalid' : ''}`}
                  {...registerProfile('city', {
                    required: 'City is required',
                  })}
                />
                {profileErrors.city && (
                  <div className="invalid-feedback">{profileErrors.city.message}</div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label required">State</label>
                <input
                  type="text"
                  className={`form-control ${profileErrors.state ? 'is-invalid' : ''}`}
                  {...registerProfile('state', {
                    required: 'State is required',
                  })}
                />
                {profileErrors.state && (
                  <div className="invalid-feedback">{profileErrors.state.message}</div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label required">Postal Code</label>
                <input
                  type="text"
                  className={`form-control ${profileErrors.postalCode ? 'is-invalid' : ''}`}
                  {...registerProfile('postalCode', {
                    required: 'Postal code is required',
                  })}
                />
                {profileErrors.postalCode && (
                  <div className="invalid-feedback">{profileErrors.postalCode.message}</div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label required">Country</label>
                <input
                  type="text"
                  className={`form-control ${profileErrors.country ? 'is-invalid' : ''}`}
                  {...registerProfile('country', {
                    required: 'Country is required',
                  })}
                />
                {profileErrors.country && (
                  <div className="invalid-feedback">{profileErrors.country.message}</div>
                )}
              </div>
            </div>

            <div className="card-footer">
              <div className="btn-list">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <i className="ti ti-device-floppy me-2"></i>
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => navigate(ROUTES.PROFILE)}
                  disabled={loading}
                >
                  <i className="ti ti-x me-2"></i>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Change Password</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} noValidate>
            <div className="row">
              <div className="col-12 mb-3">
                <label className="form-label required">Current Password</label>
                <div className="input-group">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    className={`form-control ${passwordErrors.currentPassword ? 'is-invalid' : ''}`}
                    {...registerPassword('currentPassword', {
                      required: 'Current password is required',
                    })}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    <i className={showCurrentPassword ? 'ti ti-eye-off' : 'ti ti-eye'}></i>
                  </button>
                  {passwordErrors.currentPassword && (
                    <div className="invalid-feedback">{passwordErrors.currentPassword.message}</div>
                  )}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label required">New Password</label>
                <div className="input-group">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    className={`form-control ${passwordErrors.newPassword ? 'is-invalid' : ''}`}
                    {...registerPassword('newPassword', {
                      required: 'New password is required',
                      validate: validators.password,
                    })}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    <i className={showNewPassword ? 'ti ti-eye-off' : 'ti ti-eye'}></i>
                  </button>
                  {passwordErrors.newPassword && (
                    <div className="invalid-feedback">{passwordErrors.newPassword.message}</div>
                  )}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label required">Confirm New Password</label>
                <div className="input-group">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`form-control ${passwordErrors.confirmPassword ? 'is-invalid' : ''}`}
                    {...registerPassword('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === newPassword || 'Passwords do not match',
                    })}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={showConfirmPassword ? 'ti ti-eye-off' : 'ti ti-eye'}></i>
                  </button>
                  {passwordErrors.confirmPassword && (
                    <div className="invalid-feedback">{passwordErrors.confirmPassword.message}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="card-footer">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <i className="ti ti-lock me-2"></i>
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};
