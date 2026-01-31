// Auth Layout Component - Wraps authentication pages (Login, Register, etc.)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';

export const AuthLayout = ({ children, title, subtitle, showInfoPanel = false, infoTitle, infoText, alternateRoute, alternateButtonText }) => {
  const { mode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  if (showInfoPanel) {
    // Split panel layout for Register
    return (
      <div className="page page-center" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1000 }}>
          <button 
            className="btn btn-icon" 
            onClick={toggleTheme} 
            style={{ 
              backgroundColor: 'white',
              color: mode === 'dark' ? '#fbbf24' : '#1e293b',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <i className={mode === 'dark' ? 'ti ti-sun' : 'ti ti-moon'}></i>
          </button>
        </div>
        
        <div className="container py-5" style={{ maxWidth: '1000px' }}>
          <div className="card card-md shadow-lg">
            <div className="row g-0" style={{ minHeight: '500px' }}>
              {/* Left Info Panel */}
              <div className="col-lg-4 d-none d-lg-flex" style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '3rem'
              }}>
                <div className="d-flex flex-column justify-content-center text-white w-100">
                  <h2 className="mb-3" style={{ fontWeight: 700 }}>
                    {infoTitle || 'INFORMATION'}
                  </h2>
                  <p className="mb-4" style={{ opacity: 0.9, lineHeight: 1.8 }}>
                    {infoText || 'Join TradeEase to manage your orders, track complaints, and enjoy seamless customer service. Create your account in just a few steps.'}
                  </p>
                  {alternateRoute && (
                    <button
                      className="btn btn-outline-light align-self-start"
                      onClick={() => navigate(alternateRoute)}
                    >
                      {alternateButtonText || 'Have An Account'}
                    </button>
                  )}
                </div>
              </div>

              {/* Right Form Panel */}
              <div className="col-lg-8 d-flex align-items-center">
                <div className="card-body p-4 p-lg-5 w-100">
                  <h2 className="h3 mb-1 text-primary text-uppercase" style={{ letterSpacing: 1, fontWeight: 700 }}>
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-muted mb-4">{subtitle}</p>
                  )}
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default centered layout for Login
  return (
    <div className="page page-center" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1000 }}>
        <button 
          className="btn btn-icon" 
          onClick={toggleTheme}
          style={{ 
            backgroundColor: 'white',
            color: mode === 'dark' ? '#fbbf24' : '#1e293b',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <i className={mode === 'dark' ? 'ti ti-sun' : 'ti ti-moon'}></i>
        </button>
      </div>
      
      <div className="container py-5" style={{ maxWidth: '600px' }}>
        <div className="text-center mb-4">
          <div className="mb-3">
            <div className="d-inline-flex align-items-center">
              <div 
                className="me-2" 
                style={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(135deg, #030a35 0%, #1a237e 100%)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  border: '4px solid #60A5FA',
                  borderTop: '4px solid transparent',
                  borderLeft: '4px solid transparent',
                  borderRadius: 6,
                  transform: 'rotate(-45deg)',
                }}></div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.75rem', color: '#030a35', letterSpacing: '-0.5px' }}>
                  TRADEASE
                </div>
                <div style={{ fontSize: '0.7rem', color: '#60A5FA', fontWeight: 500, letterSpacing: '1px', marginTop: '-4px' }}>
                  YOUR WORK, SIMPLIFIED
                </div>
              </div>
            </div>
          </div>
          <h2 className="h3 mb-2">{title}</h2>
          {subtitle && (
            <p className="text-muted">{subtitle}</p>
          )}
        </div>
        
        <div className="card card-md">
          <div className="card-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
