// Customer Statistics Component
import React from 'react';

export const CustomerStatistics = ({ statistics, loading }) => {
  const stats = [
    {
      title: 'Total Orders',
      value: statistics?.totalOrders || 0,
      icon: 'ti ti-shopping-cart',
      color: 'primary',
    },
    {
      title: 'Active Complaints',
      value: statistics?.activeComplaints || 0,
      icon: 'ti ti-message-report',
      color: 'warning',
    },
    {
      title: 'Total Spending',
      value: `$${statistics?.totalSpending?.toLocaleString() || 0}`,
      icon: 'ti ti-currency-dollar',
      color: 'success',
    },
    {
      title: 'Account Status',
      value: statistics?.accountStatus || 'Active',
      icon: 'ti ti-chart-line',
      color: 'info',
    },
  ];

  if (loading) {
    return (
      <div className="row row-cards">
        {[1, 2, 3, 4].map((item) => (
          <div className="col-sm-6 col-lg-3" key={item}>
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100px' }}>
                  <div className="spinner-border text-muted" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="row row-cards">
      {stats.map((stat, index) => (
        <div className="col-sm-6 col-lg-3" key={index}>
          <div className="card card-sm">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <span className={`bg-${stat.color} text-white avatar`}>
                    <i className={stat.icon}></i>
                  </span>
                </div>
                <div className="col">
                  <div className="font-weight-medium">
                    {stat.value}
                  </div>
                  <div className="text-muted">
                    {stat.title}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
