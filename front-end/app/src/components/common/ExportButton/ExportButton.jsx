// Export Button Component - Button to export data with dropdown options
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { exportToCSV, prepareDataForExport } from '../../../utils/exportUtils';

export const ExportButton = ({ 
  data = [], 
  filename = 'export', 
  fields = null,
  disabled = false,
  className = 'btn btn-outline-primary'
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (format = 'csv') => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    setIsExporting(true);
    
    try {
      const preparedData = prepareDataForExport(data, fields);
      const fileWithExt = `${filename}.${format}`;
      
      if (format === 'csv') {
        exportToCSV(preparedData, fileWithExt);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="dropdown">
      <button
        className={className}
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        disabled={disabled || isExporting || data.length === 0}
      >
        <i className="ti ti-download me-2"></i>
        {isExporting ? 'Exporting...' : 'Export'}
      </button>
      <ul className="dropdown-menu">
        <li>
          <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleExport('csv'); }}>
            <i className="ti ti-file-text me-2"></i>
            Export as CSV
          </a>
        </li>
      </ul>
    </div>
  );
};

ExportButton.propTypes = {
  data: PropTypes.array.isRequired,
  filename: PropTypes.string,
  fields: PropTypes.array,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};
