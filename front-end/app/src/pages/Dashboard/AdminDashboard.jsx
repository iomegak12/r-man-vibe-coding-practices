// Admin Dashboard Page - For administrators to view all customers and system stats
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/common/Layout/MainLayout';
import { BarChart } from '../../components/common/Charts/BarChart';
import { DonutChart } from '../../components/common/Charts/DonutChart';
import { LineChart } from '../../components/common/Charts/LineChart';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { adminAPI } from '../../api/admin.api';
import { orderAPI } from '../../api/order.api';
import { complaintAPI } from '../../api/complaint.api';
import { ROUTES } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useToast();
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    ordersByStatus: [],
    complaintsByPriority: [],
    ordersOverTime: [],
  });

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, complaintsRes] = await Promise.allSettled([
        adminAPI.getAdminStatistics(),
        orderAPI.getAllOrders({ page: 1, limit: 50 }),
        complaintAPI.getAllComplaints({ page: 1, limit: 50 }),
      ]);

      if (statsRes.status === 'fulfilled') {
        const analytics = statsRes.value.data.data;
        // Transform analytics response to match expected statistics format
        setStatistics({
          totalCustomers: analytics?.totalCustomers || 0,
          totalOrders: analytics?.orderStatistics?.totalOrders || 0,
          totalComplaints: analytics?.complaintStatistics?.totalComplaints || 0,
          activeComplaints: analytics?.complaintStatistics?.openComplaints || 0,
        });
      } else {
        console.error('Failed to fetch statistics:', statsRes.reason);
        // Set default stats if API fails
        setStatistics({
          totalCustomers: 0,
          totalOrders: 0,
          totalComplaints: 0,
          activeComplaints: 0,
        });
      }

      if (ordersRes.status === 'fulfilled') {
        const ordersData = ordersRes.value.data?.data || ordersRes.value.data;
        const orders = ordersData?.orders || ordersData?.items || [];
        setRecentOrders(orders.slice(0, 5));
        
        // Prepare chart data - Orders by Status
        const statusCounts = {};
        orders.forEach(order => {
          const status = order.orderStatus || 'Unknown';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        const ordersByStatus = Object.entries(statusCounts).map(([label, value]) => ({
          label,
          value,
        }));
        
        // Orders over time (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split('T')[0];
        });
        
        const ordersByDate = {};
        last7Days.forEach(date => {
          ordersByDate[date] = 0;
        });
        
        orders.forEach(order => {
          if (order.orderDate) {
            const orderDate = new Date(order.orderDate).toISOString().split('T')[0];
            if (ordersByDate.hasOwnProperty(orderDate)) {
              ordersByDate[orderDate]++;
            }
          }
        });
        
        const ordersOverTime = last7Days.map(date => ({
          label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: ordersByDate[date],
        }));
        
        setChartData(prev => ({ ...prev, ordersByStatus, ordersOverTime }));
      } else {
        console.error('Failed to fetch recent orders:', ordersRes.reason);
        setRecentOrders([]);
      }

      if (complaintsRes.status === 'fulfilled') {
        const complaintsData = complaintsRes.value.data?.data || complaintsRes.value.data;
        const complaints = complaintsData?.complaints || complaintsData?.items || [];
        setRecentComplaints(complaints.slice(0, 5));
        
        // Prepare chart data - Complaints by Priority
        const priorityCounts = {};
        complaints.forEach(complaint => {
          const priority = complaint.priority || 'Unknown';
          priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
        });
        
        const complaintsByPriority = Object.entries(priorityCounts).map(([label, value]) => ({
          label,
          value,
        }));
        
        setChartData(prev => ({ ...prev, complaintsByPriority }));
      } else {
        console.error('Failed to fetch recent complaints:', complaintsRes.reason);
        setRecentComplaints([]);
      }
    } catch (error) {
      console.error('Admin dashboard fetch error:', error);
      showError('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col">
            <h2 className="page-title">
              Admin Dashboard
            </h2>
            <div className="text-muted mt-1">
              Welcome back, {user?.fullName?.split(' ')[0] || 'Administrator'}!
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row row-cards mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card card-sm">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <span className="bg-primary text-white avatar">
                    <i className="ti ti-users"></i>
                  </span>
                </div>
                <div className="col">
                  <div className="font-weight-medium">
                    {loading ? '...' : statistics?.totalCustomers || 0}
                  </div>
                  <div className="text-muted">
                    Total Customers
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card card-sm">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <span className="bg-success text-white avatar">
                    <i className="ti ti-shopping-cart"></i>
                  </span>
                </div>
                <div className="col">
                  <div className="font-weight-medium">
                    {loading ? '...' : statistics?.totalOrders || 0}
                  </div>
                  <div className="text-muted">
                    Total Orders
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card card-sm">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <span className="bg-warning text-white avatar">
                    <i className="ti ti-message-report"></i>
                  </span>
                </div>
                <div className="col">
                  <div className="font-weight-medium">
                    {loading ? '...' : statistics?.activeComplaints || 0}
                  </div>
                  <div className="text-muted">
                    Active Complaints
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card card-sm">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <span className="bg-info text-white avatar">
                    <i className="ti ti-chart-line"></i>
                  </span>
                </div>
                <div className="col">
                  <div className="font-weight-medium">
                    {loading ? '...' : statistics?.totalComplaints || 0}
                  </div>
                  <div className="text-muted">
                    Total Complaints
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="row mb-4">
        <div className="col-lg-4 mb-4">
          {loading ? (
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          ) : (
            <LineChart 
              data={chartData.ordersOverTime}
              title="Orders Trend (Last 7 Days)"
              height={250}
              color="#206bc4"
            />
          )}
        </div>
        <div className="col-lg-4 mb-4">
          {loading ? (
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          ) : (
            <BarChart 
              data={chartData.ordersByStatus}
              title="Orders by Status"
              height={250}
              color="#2fb344"
            />
          )}
        </div>
        <div className="col-lg-4 mb-4">
          {loading ? (
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          ) : (
            <DonutChart 
              data={chartData.complaintsByPriority}
              title="Complaints by Priority"
            />
          )}
        </div>
      </div>

      {/* Recent Orders & Complaints */}
      <div className="row mb-4">
        {/* Recent Orders */}
        <div className="col-lg-6 mb-4 mb-lg-0">
          <div className="card h-100">
            <div className="card-header">
              <h3 className="card-title">Recent Orders</h3>
              <div className="card-actions">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => navigate(ROUTES.ADMIN_ORDERS)}
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
                <div className="text-muted text-center py-3">No recent orders</div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentOrders.map((order) => (
                    <div
                      key={order.orderId}
                      className="list-group-item list-group-item-action px-0"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(ROUTES.ADMIN_ORDER_DETAILS.replace(':orderId', order.orderId))}
                    >
                      <div className="row align-items-center">
                        <div className="col-auto">
                          <span className="avatar avatar-sm bg-primary-lt">
                            <i className="ti ti-shopping-cart"></i>
                          </span>
                        </div>
                        <div className="col">
                          <div className="text-truncate">
                            <strong>#{order.orderId}</strong> - {order.customerName}
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
                  onClick={() => navigate(ROUTES.ADMIN_COMPLAINTS)}
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
                <div className="text-muted text-center py-3">No recent complaints</div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentComplaints.map((complaint) => (
                    <div
                      key={complaint.complaintId}
                      className="list-group-item list-group-item-action px-0"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(ROUTES.ADMIN_COMPLAINT_DETAILS.replace(':complaintId', complaint.complaintId))}
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
                            {complaint.category} • {complaint.customerName}
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

      {/* Quick Actions */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quick Actions</h3>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => navigate(ROUTES.ADMIN_CUSTOMERS)}
                  >
                    <i className="ti ti-users me-2"></i>
                    Manage Customers
                  </button>
                </div>
                <div className="col-md-3">
                  <button
                    className="btn btn-success w-100"
                    onClick={() => navigate(ROUTES.ADMIN_ORDERS)}
                  >
                    <i className="ti ti-shopping-cart me-2"></i>
                    View Orders
                  </button>
                </div>
                <div className="col-md-3">
                  <button
                    className="btn btn-warning w-100"
                    onClick={() => navigate(`${ROUTES.ADMIN_COMPLAINTS}?status=Open`)}
                  >
                    <i className="ti ti-message-report me-2"></i>
                    Open Complaints
                  </button>
                </div>
                <div className="col-md-3">
                  <button
                    className="btn btn-info w-100"
                    onClick={() => fetchAdminData()}
                  >
                    <i className="ti ti-refresh me-2"></i>
                    Refresh Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
