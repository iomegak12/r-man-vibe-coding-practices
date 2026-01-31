// Main Layout with Tabler
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { ROUTES } from '../../../utils/constants';

export const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Get saved state from localStorage, default to collapsed
    return localStorage.getItem('sidebarCollapsed') !== 'false';
  });

  useEffect(() => {
    // Save sidebar state to localStorage
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
  }, [sidebarCollapsed]);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const menuItems = [
    { label: 'Home', path: '/', icon: 'ti ti-home', show: true },
    { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: 'ti ti-layout-dashboard', show: true },
    { 
      label: isAdmin ? 'Customers' : 'My Profile', 
      path: isAdmin ? ROUTES.ADMIN_CUSTOMERS : ROUTES.PROFILE, 
      icon: isAdmin ? 'ti ti-users' : 'ti ti-user',
      show: true 
    },
    { 
      label: isAdmin ? 'Orders' : 'My Orders', 
      path: isAdmin ? ROUTES.ADMIN_ORDERS : ROUTES.ORDERS, 
      icon: 'ti ti-shopping-cart',
      show: true 
    },
    { 
      label: isAdmin ? 'Complaints' : 'My Complaints', 
      path: isAdmin ? ROUTES.ADMIN_COMPLAINTS : ROUTES.COMPLAINTS, 
      icon: 'ti ti-message-report',
      show: true 
    },
  ];

  return (
    <div className="page">
      {/* Sidebar */}
      <aside 
        className={`navbar navbar-vertical navbar-expand-lg ${sidebarCollapsed ? 'navbar-collapsed' : ''}`} 
        data-bs-theme={mode}
        style={{
          width: sidebarCollapsed ? '4rem' : '15rem',
          transition: 'width 0.3s ease',
        }}
      >
        <div className="container-fluid">
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#sidebar-menu">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <h1 className="navbar-brand navbar-brand-autodark" style={{ overflow: 'hidden' }}>
            <a href="/" style={{ textDecoration: 'none' }}>
              {sidebarCollapsed ? (
                <div className="d-flex justify-content-center">
                  <div 
                    style={{
                      width: 36,
                      height: 36,
                      background: 'linear-gradient(135deg, #030a35 0%, #1a237e 100%)',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={{
                      width: 24,
                      height: 24,
                      border: '3px solid #60A5FA',
                      borderTop: '3px solid transparent',
                      borderLeft: '3px solid transparent',
                      borderRadius: 4,
                      transform: 'rotate(-45deg)',
                    }}></div>
                  </div>
                </div>
              ) : (
                <div className="d-flex align-items-center">
                  <div 
                    className="me-2" 
                    style={{
                      width: 36,
                      height: 36,
                      background: 'linear-gradient(135deg, #030a35 0%, #1a237e 100%)',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={{
                      width: 24,
                      height: 24,
                      border: '3px solid #60A5FA',
                      borderTop: '3px solid transparent',
                      borderLeft: '3px solid transparent',
                      borderRadius: 4,
                      transform: 'rotate(-45deg)',
                    }}></div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.25rem', color: mode === 'dark' ? '#f1f5f9' : '#030a35', letterSpacing: '-0.5px' }}>
                      TRADEASE
                    </div>
                    <div style={{ fontSize: '0.6rem', color: '#60A5FA', fontWeight: 500, letterSpacing: '1px', marginTop: '-4px' }}>
                      YOUR WORK, SIMPLIFIED
                    </div>
                  </div>
                </div>
              )}
            </a>
          </h1>
          
          <div className="navbar-nav flex-row d-lg-none">
            <div className="nav-item">
              <button className="nav-link px-0" onClick={toggleTheme}>
                <i className={mode === 'dark' ? 'ti ti-sun' : 'ti ti-moon'}></i>
              </button>
            </div>
          </div>
          
          <div className="collapse navbar-collapse" id="sidebar-menu">
            <ul className="navbar-nav pt-lg-3">
              {menuItems.map((item) => item.show && (
                <li key={item.path} className={`nav-item ${isActive(item.path) ? 'active' : ''}`}>
                  <a 
                    className="nav-link" 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); navigate(item.path); }}
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    <span className="nav-link-icon d-md-none d-lg-inline-block">
                      <i className={item.icon}></i>
                    </span>
                    {!sidebarCollapsed && <span className="nav-link-title">{item.label}</span>}
                  </a>
                </li>
              ))}
            </ul>
            
            {/* Collapse/Expand Button */}
            <div className="mt-auto mb-3">
              <button 
                className="btn w-100" 
                onClick={toggleSidebar}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <i className={`ti ${sidebarCollapsed ? 'ti-chevron-right' : 'ti-chevron-left'}`}></i>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="page-wrapper" style={{
        marginLeft: sidebarCollapsed ? '4rem' : '15rem',
        transition: 'margin-left 0.3s ease',
      }}>
        {/* Header */}
        <div className="page-header d-print-none">
          <div className="container-xl">
            <div className="row g-2 align-items-center">
              <div className="col">
                {/* Page title can be added here */}
              </div>
              <div className="col-auto ms-auto d-print-none">
                <div className="btn-list">
                  {/* Theme Toggle */}
                  <button className="btn" onClick={toggleTheme}>
                    <i className={mode === 'dark' ? 'ti ti-sun' : 'ti ti-moon'}></i>
                  </button>
                  
                  {/* User Dropdown */}
                  <div className="dropdown">
                    <button className="btn dropdown-toggle" data-bs-toggle="dropdown">
                      <span className="avatar avatar-sm rounded" style={{ backgroundColor: '#206bc4' }}>
                        {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </span>
                      <div className="d-none d-xl-block ps-2">
                        <div>{user?.fullName || 'User'}</div>
                        <div className="mt-1 small text-muted">{user?.role || 'Customer'}</div>
                      </div>
                    </button>
                    <div className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                      <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); navigate(ROUTES.PROFILE); }}>
                        <i className="ti ti-user me-2"></i>Profile
                      </a>
                      <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); navigate(ROUTES.PROFILE_EDIT); }}>
                        <i className="ti ti-settings me-2"></i>Settings
                      </a>
                      <div className="dropdown-divider"></div>
                      <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                        <i className="ti ti-logout me-2"></i>Logout
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Body */}
        <div className="page-body">
          <div className="container-xl">
            {children}
          </div>
        </div>
        
        {/* Footer */}
        <footer className="footer footer-transparent d-print-none">
          <div className="container-xl">
            <div className="row text-center align-items-center">
              <div className="col-12 col-lg-auto mt-3 mt-lg-0">
                <ul className="list-inline list-inline-dots mb-0">
                  <li className="list-inline-item">
                    Copyright © {new Date().getFullYear()} TradeEase. All rights reserved.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
