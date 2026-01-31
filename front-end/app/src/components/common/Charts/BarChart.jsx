// Simple Bar Chart Component
import React from 'react';
import PropTypes from 'prop-types';

export const BarChart = ({ data, title, height = 300, color = '#206bc4' }) => {
  if (!data || data.length === 0) {
    return <div className="text-muted text-center py-4">No data available</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
      </div>
      <div className="card-body">
        <div className="d-flex align-items-end" style={{ height: `${height}px` }}>
          {data.map((item, index) => {
            const barHeight = maxValue > 0 ? (item.value / maxValue) * (height - 60) : 0;
            return (
              <div
                key={index}
                className="flex-fill px-2"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}
              >
                <div className="text-muted small mb-1">{item.value}</div>
                <div
                  className="rounded-top"
                  style={{
                    width: '100%',
                    height: `${barHeight}px`,
                    backgroundColor: color,
                    transition: 'height 0.3s ease',
                    minHeight: item.value > 0 ? '10px' : '0px',
                  }}
                  title={`${item.label}: ${item.value}`}
                ></div>
                <div className="text-center small mt-2" style={{ fontSize: '0.75rem' }}>
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

BarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ).isRequired,
  title: PropTypes.string.isRequired,
  height: PropTypes.number,
  color: PropTypes.string,
};
