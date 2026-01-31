// Service Health Context - Monitor backend service status
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth.api';
import { customerAPI } from '../api/customer.api';
import { orderAPI } from '../api/order.api';
import { complaintAPI } from '../api/complaint.api';
import { HEALTH_CHECK_INTERVAL } from '../utils/constants';

const ServiceHealthContext = createContext();

const initialHealthState = {
  aths: { status: 'unknown', lastChecked: null },
  crms: { status: 'unknown', lastChecked: null },
  orms: { status: 'unknown', lastChecked: null },
  cmps: { status: 'unknown', lastChecked: null },
};

export const ServiceHealthProvider = ({ children }) => {
  const [services, setServices] = useState(initialHealthState);
  const [isChecking, setIsChecking] = useState(false);

  const checkServiceHealth = useCallback(async (serviceName, healthCheckFn) => {
    try {
      await healthCheckFn();
      return {
        status: 'healthy',
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'down',
        lastChecked: new Date().toISOString(),
      };
    }
  }, []);

  const checkAllServices = useCallback(async () => {
    setIsChecking(true);
    
    try {
      // Check all service health endpoints in parallel
      const [athsHealth, crmsHealth, ormsHealth, cmpsHealth] = await Promise.allSettled([
        checkServiceHealth('aths', () => authAPI.healthCheck()),
        checkServiceHealth('crms', () => customerAPI.healthCheck()),
        checkServiceHealth('orms', () => orderAPI.healthCheck()),
        checkServiceHealth('cmps', () => complaintAPI.healthCheck()),
      ]);
      
      setServices({
        aths: athsHealth.status === 'fulfilled' ? athsHealth.value : { status: 'down', lastChecked: new Date().toISOString() },
        crms: crmsHealth.status === 'fulfilled' ? crmsHealth.value : { status: 'down', lastChecked: new Date().toISOString() },
        orms: ormsHealth.status === 'fulfilled' ? ormsHealth.value : { status: 'down', lastChecked: new Date().toISOString() },
        cmps: cmpsHealth.status === 'fulfilled' ? cmpsHealth.value : { status: 'down', lastChecked: new Date().toISOString() },
      });
    } catch (error) {
      console.error('Health check error:', error);
    } finally {
      setIsChecking(false);
    }
  }, [checkServiceHealth]);

  // Check health on mount and set up polling
  useEffect(() => {
    checkAllServices();

    const interval = setInterval(() => {
      checkAllServices();
    }, HEALTH_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [checkAllServices]);

  const value = {
    services,
    isChecking,
    checkAllServices,
  };

  return (
    <ServiceHealthContext.Provider value={value}>
      {children}
    </ServiceHealthContext.Provider>
  );
};

export const useServiceHealth = () => {
  const context = useContext(ServiceHealthContext);
  if (!context) {
    throw new Error('useServiceHealth must be used within ServiceHealthProvider');
  }
  return context;
};
