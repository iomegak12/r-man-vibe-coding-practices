// Service Health Indicator Component
import React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { useServiceHealth } from '../../../contexts/ServiceHealthContext';
import { formatters } from '../../../utils/formatters';

export const ServiceHealth = () => {
  const { services } = useServiceHealth();

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'down':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'healthy':
        return 'All Systems Operational';
      case 'down':
        return 'Service Issues Detected';
      default:
        return 'System Status Unknown';
    }
  };

  // Determine overall status
  const allHealthy = Object.values(services).every((s) => s.status === 'healthy');
  const anyDown = Object.values(services).some((s) => s.status === 'down');

  const overallStatus = anyDown ? 'down' : allHealthy ? 'healthy' : 'unknown';

  const tooltipContent = (
    <Box sx={{ p: 1 }}>
      {Object.entries(services).map(([name, data]) => (
        <Box
          key={name}
          sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 0.5 }}
        >
          <span>{name.toUpperCase()}:</span>
          <strong>{data.status}</strong>
        </Box>
      ))}
      {services.aths.lastChecked && (
        <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider', fontSize: '0.75rem' }}>
          Last checked: {formatters.relativeTime(services.aths.lastChecked)}
        </Box>
      )}
    </Box>
  );

  return (
    <Tooltip title={tooltipContent} arrow>
      <Chip
        label={getStatusLabel(overallStatus)}
        color={getStatusColor(overallStatus)}
        size="small"
        variant="outlined"
        sx={{ cursor: 'pointer' }}
      />
    </Tooltip>
  );
};
