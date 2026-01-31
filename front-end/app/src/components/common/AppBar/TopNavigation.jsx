// Top Navigation Bar Component
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { UserMenu } from './UserMenu';
import { ServiceHealth } from './ServiceHealth';
import { ROUTES } from '../../../utils/constants';

export const TopNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();
  const { mode, toggleTheme } = useTheme();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const menuItems = [
    { label: 'Home', path: ROUTES.HOME, show: true },
    { label: 'Dashboard', path: ROUTES.DASHBOARD, show: isAuthenticated },
    { 
      label: isAdmin ? 'Customers' : 'My Profile', 
      path: isAdmin ? ROUTES.ADMIN_CUSTOMERS : ROUTES.PROFILE, 
      show: isAuthenticated 
    },
    { 
      label: isAdmin ? 'Orders' : 'My Orders', 
      path: isAdmin ? ROUTES.ADMIN_ORDERS : ROUTES.ORDERS, 
      show: isAuthenticated 
    },
    { 
      label: isAdmin ? 'Complaints' : 'My Complaints', 
      path: isAdmin ? ROUTES.ADMIN_COMPLAINTS : ROUTES.COMPLAINTS, 
      show: isAuthenticated 
    },
  ];

  return (
    <AppBar position="sticky" elevation={1} sx={{ backgroundColor: mode === 'dark' ? 'background.paper' : '#ffffff', color: mode === 'dark' ? 'text.primary' : '#000000' }}>
      <Toolbar sx={{ py: 1 }}>
        {/* Logo - Left Side */}
        <Box
          onClick={() => navigate(ROUTES.HOME)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            mr: 6,
            gap: 1.5,
          }}
        >
          {/* Logo Icon */}
          <Box
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #030a35 0%, #1a237e 100%)',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                border: '3px solid #60A5FA',
                borderTop: '3px solid transparent',
                borderLeft: '3px solid transparent',
                borderRadius: '4px',
                transform: 'rotate(-45deg)',
              }}
            />
          </Box>
          
          {/* Logo Text */}
          <Box>
            <Box
              component="span"
              sx={{
                fontWeight: 700,
                fontSize: '1.5rem',
                color: mode === 'dark' ? 'text.primary' : '#030a35',
                letterSpacing: '-0.5px',
              }}
            >
              TRADEASE
            </Box>
            <Box
              component="span"
              sx={{
                display: 'block',
                fontSize: '0.65rem',
                color: '#60A5FA',
                fontWeight: 500,
                letterSpacing: '1px',
                mt: -0.5,
              }}
            >
              YOUR WORK, SIMPLIFIED
            </Box>
          </Box>
        </Box>

        {/* Navigation Menu - Center */}
        <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1, justifyContent: 'center' }}>
          {menuItems.map((item) =>
            item.show ? (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  color: mode === 'dark' ? 'text.primary' : '#000000',
                  fontWeight: isActive(item.path) ? 600 : 400,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  px: 2.5,
                  py: 1,
                  borderRadius: 0,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: isActive(item.path) ? '80%' : '0%',
                    height: 2,
                    backgroundColor: 'primary.main',
                    transition: 'width 0.3s ease',
                  },
                  '&:hover::after': {
                    width: '80%',
                  },
                }}
              >
                {item.label}
              </Button>
            ) : null
          )}
        </Box>

        {/* Right Side Controls - Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Service Health */}
          {isAuthenticated && <ServiceHealth />}

          {/* Theme Toggle */}
          <IconButton 
            onClick={toggleTheme} 
            sx={{ 
              color: mode === 'dark' ? 'text.primary' : '#000000',
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {/* Cart Icon (placeholder for future) */}
          {isAuthenticated && (
            <IconButton 
              onClick={() => navigate(ROUTES.ORDERS)}
              sx={{ 
                color: mode === 'dark' ? 'text.primary' : '#000000',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              <Badge badgeContent={0} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          )}

          {/* User Menu or Account Icon */}
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <IconButton 
              onClick={() => navigate(ROUTES.LOGIN)}
              sx={{ 
                color: mode === 'dark' ? 'text.primary' : '#000000',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              <AccountCircleIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
