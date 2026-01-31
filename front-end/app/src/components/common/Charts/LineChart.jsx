// Simple Line Chart Component
import React from 'react';
import PropTypes from 'prop-types';

export const LineChart = ({ data, title, height = 200, color = '#206bc4', showGrid = true }) => {
  if (!data || data.length === 0) {
    return <div className="text-muted text-center py-4">No data available</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const range = maxValue - minValue || 1;

  const width = 100; // percentage
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((item.value - minValue) / range) * (height - 40);
    return { x, y, value: item.value, label: item.label };
  });

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x},${point.y}`
  ).join(' ');

  // Area fill path
  const areaPathData = `${pathData} L ${points[points.length - 1].x},${height} L 0,${height} Z`;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
      </div>
      <div className="card-body">
        <div style={{ position: 'relative', height: `${height + 40}px` }}>
          <svg
            width="100%"
            height={height + 40}
            viewBox={`0 0 ${width} ${height + 40}`}
            preserveAspectRatio="none"
            style={{ overflow: 'visible' }}
          >
            {/* Grid lines */}
            {showGrid && (
              <g stroke="#e6e7e9" strokeWidth="0.5">
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={ratio * height}
                    x2={width}
                    y2={ratio * height}
                    opacity="0.5"
                  />
                ))}
              </g>
            )}

            {/* Area fill */}
            <path
              d={areaPathData}
              fill={color}
              fillOpacity="0.1"
            />

            {/* Line */}
            <path
              d={pathData}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />

            {/* Points */}
            {points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="0.8"
                  fill={color}
                  vectorEffect="non-scaling-stroke"
                />
                <title>{`${point.label}: ${point.value}`}</title>
              </g>
            ))}
          </svg>
          
          {/* X-axis labels */}
          <div className="d-flex justify-content-between mt-2">
            {data.map((item, index) => (
              <div key={index} className="text-muted small" style={{ fontSize: '0.7rem' }}>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

LineChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ).isRequired,
  title: PropTypes.string.isRequired,
  height: PropTypes.number,
  color: PropTypes.string,
  showGrid: PropTypes.bool,
};
