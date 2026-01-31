// My Profile Page - View customer profile details
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/common/Layout/MainLayout';
import { CustomerProfile } from '../../components/customer/CustomerProfile';
import { useToast } from '../../contexts/ToastContext';
import { customerAPI } from '../../api/customer.api';
import { ROUTES } from '../../utils/constants';

export const MyProfilePage = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await customerAPI.getMyProfile();
      setCustomer(response.data.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      showError('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col">
            <h2 className="page-title">My Profile</h2>
            <div className="text-muted mt-1">
              View and manage your profile information
            </div>
          </div>
          <div className="col-auto ms-auto d-print-none">
            <button
              className="btn btn-primary"
              onClick={() => navigate(ROUTES.PROFILE_EDIT)}
            >
              <i className="ti ti-edit me-2"></i>
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <CustomerProfile customer={customer} loading={loading} />
    </MainLayout>
  );
};
