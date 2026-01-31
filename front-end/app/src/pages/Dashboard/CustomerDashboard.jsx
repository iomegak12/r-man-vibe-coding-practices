// Customer Dashboard Page
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/common/Layout/MainLayout';
import { CustomerStatistics } from '../../components/customer/CustomerStatistics';
import { CustomerProfile } from '../../components/customer/CustomerProfile';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { customerAPI } from '../../api/customer.api';
import { orderAPI } from '../../api/order.api';
import { complaintAPI } from '../../api/complaint.api';
import { ROUTES } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useToast();
  const [customer, setCustomer] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [profileRes, statsRes, ordersRes, complaintsRes] = await Promise.allSettled([
        customerAPI.getMyProfile(),
        customerAPI.getMyStatistics(),
        orderAPI.getMyOrders({ page: 1, limit: 5 }),
        complaintAPI.getMyComplaints({ page: 1, limit: 5 }),
      ]);

      if (profileRes.status === 'fulfilled') {
        setCustomer(profileRes.value.data.data);
      } else {
        console.error('Failed to fetch profile:', profileRes.reason);
      }

      if (statsRes.status === 'fulfilled') {
        setStatistics(statsRes.value.data.data);
      } else {
        console.error('Failed to fetch statistics:', statsRes.reason);
      }

      if (ordersRes.status === 'fulfilled') {
        const ordersData = ordersRes.value.data?.data || ordersRes.value.data;
        const orders = ordersData?.orders || ordersData?.items || [];
        setRecentOrders(orders.slice(0, 5));
      } else {
        console.error('Failed to fetch recent orders:', ordersRes.reason);
        setRecentOrders([]);
      }

      if (complaintsRes.status === 'fulfilled') {
        const complaintsData = complaintsRes.value.data?.data || complaintsRes.value.data;
        const complaints = complaintsData?.complaints || complaintsData?.items || [];
        setRecentComplaints(complaints.slice(0, 5));
      } else {
        console.error('Failed to fetch recent complaints:', complaintsRes.reason);
        setRecentComplaints([]);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col">
            <h2 className="page-title">
              Welcome back, {user?.fullName?.split(' ')[0] || 'Customer'}!
            </h2>
            <div className="text-muted mt-1">
              Here's an overview of your account
            </div>
          </div>
          <div className="col-auto ms-auto d-print-none">
            <div className="btn-list">
              <button
                className="btn btn-outline-primary"
                onClick={() => navigate(ROUTES.ORDERS_CREATE)}
              >
                <i className="ti ti-shopping-cart me-2"></i>
                New Order
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={() => navigate(ROUTES.COMPLAINTS_CREATE)}
              >
                <i className="ti ti-message-report me-2"></i>
                New Complaint
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-4">
        <CustomerStatistics statistics={statistics} loading={loading} />
      </div>

      {/* Profile Overview */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="mb-0">Profile Information</h3>
            <button
              className="btn btn-primary"
              onClick={() => navigate(ROUTES.PROFILE_EDIT)}
            >
              <i className="ti ti-edit me-2"></i>
              Edit Profile
            </button>
          </div>
          <CustomerProfile customer={customer} loading={loading} />
        </div>
      </div>

      {/* Recent Orders & Complaints */}
      <div className="row">
        {/* Recent Orders */}
        <div className="col-lg-6 mb-4 mb-lg-0">
          <div className="card h-100">
            <div className="card-header">
              <h3 className="card-title">Recent Orders</h3>
              <div className="card-actions">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => navigate(ROUTES.ORDERS)}
                >
                  View All
                </button>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-muted text-center py-3">
                  No orders yet. <a href="#" onClick={(e) => {e.preventDefault(); navigate(ROUTES.ORDERS_CREATE);}}>Create your first order</a>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentOrders.map((order) => (
                    <div
                      key={order.orderId}
                      className="list-group-item list-group-item-action px-0"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(ROUTES.ORDER_DETAILS.replace(':orderId', order.orderId))}
                    >
                      <div className="row align-items-center">
                        <div className="col-auto">
                          <span className="avatar avatar-sm bg-primary-lt">
                            <i className="ti ti-shopping-cart"></i>
                          </span>
                        </div>
                        <div className="col">
                          <div className="text-truncate">
                            <strong>#{order.orderId}</strong>
                          </div>
                          <div className="text-muted small">
                            {order.items?.length || 0} items • {formatCurrency(order.totalAmount)}
                          </div>
                        </div>
                        <div className="col-auto">
                          <span className={`badge bg-${
                            order.orderStatus === 'Delivered' ? 'success' :
                            order.orderStatus === 'Shipped' ? 'info' :
                            order.orderStatus === 'Processing' ? 'warning' : 'secondary'
                          } text-white`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <h3 className="card-title">Recent Complaints</h3>
              <div className="card-actions">
                <button
                  className="btn btn-sm btn-warning"
                  onClick={() => navigate(ROUTES.COMPLAINTS)}
                >
                  View All
                </button>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : recentComplaints.length === 0 ? (
                <div className="text-muted text-center py-3">
                  No complaints filed. <a href="#" onClick={(e) => {e.preventDefault(); navigate(ROUTES.COMPLAINTS_CREATE);}}>File a complaint</a>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentComplaints.map((complaint) => (
                    <div
                      key={complaint.complaintId}
                      className="list-group-item list-group-item-action px-0"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(ROUTES.COMPLAINT_DETAILS.replace(':complaintId', complaint.complaintId))}
                    >
                      <div className="row align-items-center">
                        <div className="col-auto">
                          <span className={`avatar avatar-sm bg-${
                            complaint.priority === 'Critical' ? 'danger' :
                            complaint.priority === 'High' ? 'warning' : 'info'
                          }-lt`}>
                            <i className="ti ti-alert-triangle"></i>
                          </span>
                        </div>
                        <div className="col">
                          <div className="text-truncate">
                            <strong>#{complaint.complaintId}</strong> - {complaint.subject}
                          </div>
                          <div className="text-muted small">
                            {complaint.category}
                          </div>
                        </div>
                        <div className="col-auto">
                          <span className={`badge bg-${
                            complaint.status === 'Resolved' ? 'success' :
                            complaint.status === 'In Progress' ? 'info' :
                            complaint.status === 'Open' ? 'danger' : 'secondary'
                          } text-white`}>
                            {complaint.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
