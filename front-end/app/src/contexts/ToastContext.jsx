// Toast Context - Global notification system
import React, { createContext, useContext, useState, useCallback } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { TOAST_DURATION } from '../utils/constants';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, message, duration) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type,
      message,
      duration: duration || TOAST_DURATION[type.toUpperCase()] || 3000,
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const showSuccess = useCallback(
    (message, duration) => showToast('success', message, duration),
    [showToast]
  );

  const showError = useCallback(
    (message, duration) => showToast('error', message, duration),
    [showToast]
  );

  const showWarning = useCallback(
    (message, duration) => showToast('warning', message, duration),
    [showToast]
  );

  const showInfo = useCallback(
    (message, duration) => showToast('info', message, duration),
    [showToast]
  );

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const handleClose = (id) => (event, reason) => {
    if (reason === 'clickaway') return;
    dismissToast(id);
  };

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismissToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.map((toast) => (
        <Snackbar
          key={toast.id}
          open={true}
          autoHideDuration={toast.duration}
          onClose={handleClose(toast.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 8 }}
        >
          <Alert
            onClose={handleClose(toast.id)}
            severity={toast.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
