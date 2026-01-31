// Dashboard Page - Landing page after login
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { MainLayout } from '../components/common/Layout/MainLayout';
import { useAuth } from '../contexts/AuthContext';

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <MainLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Dashboard overview coming soon...
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Total Orders</Typography>
              <Typography variant="h4" color="primary">
                -
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Active Complaints</Typography>
              <Typography variant="h4" color="warning.main">
                -
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Pending Actions</Typography>
              <Typography variant="h4" color="error.main">
                -
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Account Status</Typography>
              <Typography variant="h4" color="success.main">
                Active
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
};
