// Formatting utilities
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

export const formatters = {
  // Format currency
  currency: (amount, currency = 'INR') => {
    if (amount === null || amount === undefined) return '—';
    
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return formatter.format(amount);
  },

  // Format number
  number: (value, decimals = 0) => {
    if (value === null || value === undefined) return '—';
    
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  },

  // Format date
  date: (dateString, formatString = 'MMM dd, yyyy') => {
    if (!dateString) return '—';
    
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      if (!isValid(date)) return '—';
      return format(date, formatString);
    } catch (error) {
      console.error('Date formatting error:', error);
      return '—';
    }
  },

  // Format date and time
  dateTime: (dateString, formatString = 'MMM dd, yyyy HH:mm') => {
    if (!dateString) return '—';
    
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      if (!isValid(date)) return '—';
      return format(date, formatString);
    } catch (error) {
      console.error('DateTime formatting error:', error);
      return '—';
    }
  },

  // Format relative time (e.g., "2 hours ago")
  relativeTime: (dateString) => {
    if (!dateString) return '—';
    
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      if (!isValid(date)) return '—';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Relative time formatting error:', error);
      return '—';
    }
  },

  // Format phone number
  phone: (phoneNumber) => {
    if (!phoneNumber) return '—';
    
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Format for Indian numbers (+91 XXXXX XXXXX)
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }
    
    return phoneNumber;
  },

  // Truncate text
  truncate: (text, maxLength = 50, suffix = '...') => {
    if (!text) return '—';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  },

  // Format file size
  fileSize: (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  },

  // Format percentage
  percentage: (value, decimals = 1) => {
    if (value === null || value === undefined) return '—';
    return `${formatters.number(value, decimals)}%`;
  },

  // Format order status to display text
  orderStatus: (status) => {
    const statusMap = {
      'Placed': 'Placed',
      'Processing': 'Processing',
      'Shipped': 'Shipped',
      'Delivered': 'Delivered',
      'Cancelled': 'Cancelled',
      'Return Requested': 'Return Requested',
      'Returned': 'Returned',
    };
    return statusMap[status] || status;
  },

  // Format complaint status to display text
  complaintStatus: (status) => {
    const statusMap = {
      'Open': 'Open',
      'In Progress': 'In Progress',
      'Resolved': 'Resolved',
      'Closed': 'Closed',
      'Reopened': 'Reopened',
    };
    return statusMap[status] || status;
  },

  // Capitalize first letter
  capitalize: (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  // Format initials from name
  initials: (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  },
};
