// Helper functions - convenience exports from formatters
import { formatters } from './formatters';

export const formatCurrency = (amount, currency = 'INR') => formatters.currency(amount, currency);
export const formatDate = (dateString, formatString) => formatters.date(dateString, formatString);
export const formatDateTime = (dateString, formatString) => formatters.dateTime(dateString, formatString);
export const formatRelativeTime = (dateString) => formatters.relativeTime(dateString);
export const formatPhone = (phoneNumber) => formatters.phone(phoneNumber);
export const formatNumber = (value, decimals) => formatters.number(value, decimals);
export const truncateText = (text, maxLength, suffix) => formatters.truncate(text, maxLength, suffix);
export const formatFileSize = (bytes) => formatters.fileSize(bytes);
