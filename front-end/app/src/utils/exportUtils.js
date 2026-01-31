// Export Utilities - Functions to export data to CSV and Excel formats
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, filename);
};

export const exportToExcel = (data, filename = 'export.xlsx') => {
  // For Excel export, we'll use CSV format with .xlsx extension
  // In a production app, you'd use a library like xlsx or exceljs
  exportToCSV(data, filename.replace('.xlsx', '.csv'));
};

const downloadFile = (blob, filename) => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
};

// Format data for export by flattening nested objects
export const prepareDataForExport = (data, fields = null) => {
  if (!data || data.length === 0) return [];

  return data.map(item => {
    const flattened = {};
    
    // If fields specified, only include those
    const keysToProcess = fields || Object.keys(item);
    
    keysToProcess.forEach(key => {
      const value = item[key];
      
      // Handle nested objects
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.keys(value).forEach(nestedKey => {
          flattened[`${key}_${nestedKey}`] = value[nestedKey];
        });
      } else if (Array.isArray(value)) {
        // Convert arrays to comma-separated strings
        flattened[key] = value.join(', ');
      } else {
        flattened[key] = value;
      }
    });
    
    return flattened;
  });
};
