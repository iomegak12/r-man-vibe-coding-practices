// Simple Donut Chart Component
import React from 'react';
import PropTypes from 'prop-types';

export const DonutChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return <div className="text-muted text-center py-4">No data available</div>;
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const colors = [
    '#206bc4', // blue
    '#4299e1', // light blue
    '#f59f00', // yellow
    '#d63939', // red
    '#2fb344', // green
    '#ae3ec9', // purple
    '#fd7e14', // orange
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
      </div>
      <div className="card-body">
        <div className="row align-items-center">
          <div className="col-auto">
            {/* Simple progress ring */}
            <div className="chart-circle chart-circle-lg" style={{ fontSize: '24px' }}>
              <div className="position-relative d-inline-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px' }}>
                <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                  {data.map((item, index) => {
                    const previousTotal = data.slice(0, index).reduce((sum, d) => sum + d.value, 0);
                    const percentage = total > 0 ? (item.value / total) * 100 : 0;
                    const offset = total > 0 ? (previousTotal / total) * 314 : 0;
                    const strokeDasharray = total > 0 ? `${(percentage / 100) * 314} 314` : '0 314';
                    
                    return (
                      <circle
                        key={index}
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke={colors[index % colors.length]}
                        strokeWidth="20"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={-offset}
                        style={{ transition: 'stroke-dasharray 0.3s ease' }}
                      />
                    );
                  })}
                </svg>
                <div className="position-absolute text-center">
                  <div className="h3 mb-0">{total}</div>
                  <div className="text-muted small">Total</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="row g-2">
              {data.map((item, index) => {
                const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                return (
                  <div key={index} className="col-12">
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded me-2"
                        style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: colors[index % colors.length],
                        }}
                      ></div>
                      <div className="flex-fill">
                        <div className="d-flex justify-content-between">
                          <span>{item.label}</span>
                          <span className="text-muted">{item.value} ({percentage}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

DonutChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ).isRequired,
  title: PropTypes.string.isRequired,
};
