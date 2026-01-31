// Empty State Component - Display when lists are empty
import React from 'react';
import PropTypes from 'prop-types';

export const EmptyState = ({ 
  icon = 'ti ti-inbox', 
  title = 'No data available', 
  description = '', 
  actionLabel = '', 
  onAction = null,
  variant = 'default'
}) => {
  const getIconColor = () => {
    switch (variant) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'danger': return 'text-danger';
      case 'info': return 'text-info';
      default: return 'text-muted';
    }
  };

  return (
    <div className="empty">
      <div className="empty-icon">
        <i className={`${icon} ${getIconColor()}`} style={{ fontSize: '4rem' }}></i>
      </div>
      <p className="empty-title">{title}</p>
      {description && <p className="empty-subtitle text-muted">{description}</p>}
      {actionLabel && onAction && (
        <div className="empty-action">
          <button className="btn btn-primary" onClick={onAction}>
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'danger', 'info']),
};
