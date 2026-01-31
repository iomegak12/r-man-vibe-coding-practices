import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ServiceHealthProvider } from './contexts/ServiceHealthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary/ErrorBoundary';
import { ProtectedRoute } from './components/common/ProtectedRoute/ProtectedRoute';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { HomePage } from './pages/HomePage';
import { DashboardRouter } from './pages/Dashboard/DashboardRouter';
import { MyProfilePage } from './pages/Customer/MyProfilePage';
import { EditProfilePage } from './pages/Customer/EditProfilePage';
import { AllCustomersPage } from './pages/Admin/AllCustomersPage';
import { CustomerDetailPage } from './pages/Admin/CustomerDetailPage';
import { AllOrdersPage } from './pages/Admin/AllOrdersPage';
import { AdminOrderDetailsPage } from './pages/Admin/AdminOrderDetailsPage';
import { AllComplaintsPage } from './pages/Admin/AllComplaintsPage';
import { AdminComplaintDetailsPage } from './pages/Admin/AdminComplaintDetailsPage';
import { MyOrdersPage } from './pages/Order/MyOrdersPage';
import { OrderDetailsPage } from './pages/Order/OrderDetailsPage';
import { CreateOrderPage } from './pages/Order/CreateOrderPage';
import { MyComplaintsPage } from './pages/Complaint/MyComplaintsPage';
import { ComplaintDetailsPage } from './pages/Complaint/ComplaintDetailsPage';
import { CreateComplaintPage } from './pages/Complaint/CreateComplaintPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <ServiceHealthProvider>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/unauthorized" element={<UnauthorizedPage />} />

                  {/* Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardRouter />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <MyProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile/edit"
                    element={
                      <ProtectedRoute>
                        <EditProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Order Routes */}
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <MyOrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders/create"
                    element={
                      <ProtectedRoute>
                        <CreateOrderPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders/:orderId"
                    element={
                      <ProtectedRoute>
                        <OrderDetailsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Complaint Routes */}
                  <Route
                    path="/complaints"
                    element={
                      <ProtectedRoute>
                        <MyComplaintsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/complaints/create"
                    element={
                      <ProtectedRoute>
                        <CreateComplaintPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/complaints/:complaintId"
                    element={
                      <ProtectedRoute>
                        <ComplaintDetailsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin/customers"
                    element={
                      <ProtectedRoute requiredRole="Administrator">
                        <AllCustomersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/customers/:customerId"
                    element={
                      <ProtectedRoute requiredRole="Administrator">
                        <CustomerDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <ProtectedRoute requiredRole="Administrator">
                        <AllOrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/orders/:orderId"
                    element={
                      <ProtectedRoute requiredRole="Administrator">
                        <AdminOrderDetailsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/complaints"
                    element={
                      <ProtectedRoute requiredRole="Administrator">
                        <AllComplaintsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/complaints/:complaintId"
                    element={
                      <ProtectedRoute requiredRole="Administrator">
                        <AdminComplaintDetailsPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* 404 Not Found */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </ServiceHealthProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
