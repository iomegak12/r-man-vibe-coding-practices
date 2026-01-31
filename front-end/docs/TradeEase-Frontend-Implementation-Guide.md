# TradeEase Frontend Implementation Guide
## React Web Application - Phased Development Plan

**Project Name:** TradeEase  
**Framework:** React 18 (JavaScript)  
**Version:** 1.0  
**Created:** January 28, 2026  
**Developer:** Ramkumar

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [Project Structure](#2-project-structure)
3. [Theme Configuration](#3-theme-configuration)
4. [Application Architecture](#4-application-architecture)
5. [Phased Implementation Plan](#5-phased-implementation-plan)
6. [Component Breakdown](#6-component-breakdown)
7. [Context Providers](#7-context-providers)
8. [Routing Strategy](#8-routing-strategy)
9. [API Integration Patterns](#9-api-integration-patterns)
10. [Testing Strategy](#10-testing-strategy)

---

## 1. Technology Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.2.0 | UI library |
| `react-dom` | ^18.2.0 | React DOM renderer |
| `react-router-dom` | ^6.20.0 | Client-side routing |
| `@mui/material` | ^5.15.0 | UI component library |
| `@mui/icons-material` | ^5.15.0 | Material icons |
| `@emotion/react` | ^11.11.0 | CSS-in-JS (required by MUI) |
| `@emotion/styled` | ^11.11.0 | Styled components (required by MUI) |
| `axios` | ^1.6.0 | HTTP client |
| `react-hook-form` | ^7.49.0 | Form validation |
| `date-fns` | ^3.0.0 | Date formatting and manipulation |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@testing-library/react` | ^14.1.0 | Component testing |
| `@testing-library/jest-dom` | ^6.1.0 | Custom jest matchers |
| `@testing-library/user-event` | ^14.5.0 | User interaction simulation |

### Environment Requirements

- **Node.js:** v22.x
- **npm:** v10.x or higher
- **Browser Support:** Modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)

---

## 2. Project Structure

```
front-end/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── api/                          # API integration layer
│   │   ├── axios-instance.js         # Configured axios instance
│   │   ├── interceptors.js           # Request/response interceptors
│   │   ├── endpoints.js              # API endpoint constants
│   │   ├── auth.api.js               # ATHS API calls
│   │   ├── customer.api.js           # CRMS API calls
│   │   ├── order.api.js              # ORMS API calls
│   │   └── complaint.api.js          # CMPS API calls
│   ├── assets/                       # Static assets
│   │   ├── images/
│   │   └── logos/
│   ├── components/                   # Reusable components
│   │   ├── common/                   # Common UI components
│   │   │   ├── AppBar/
│   │   │   │   ├── TopNavigation.jsx
│   │   │   │   ├── UserMenu.jsx
│   │   │   │   └── ServiceHealth.jsx
│   │   │   ├── Layout/
│   │   │   │   ├── MainLayout.jsx
│   │   │   │   └── AuthLayout.jsx
│   │   │   ├── Loader/
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   ├── ErrorBoundary/
│   │   │   │   └── ErrorBoundary.jsx
│   │   │   ├── Toast/
│   │   │   │   └── ToastNotification.jsx
│   │   │   ├── ConfirmDialog/
│   │   │   │   └── ConfirmDialog.jsx
│   │   │   └── ProtectedRoute/
│   │   │       └── ProtectedRoute.jsx
│   │   ├── auth/                     # Authentication components
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   ├── ForgotPasswordForm.jsx
│   │   │   └── ResetPasswordForm.jsx
│   │   ├── customer/                 # Customer components
│   │   │   ├── CustomerProfile.jsx
│   │   │   ├── CustomerStatistics.jsx
│   │   │   ├── CustomerList.jsx
│   │   │   ├── CustomerDetails.jsx
│   │   │   └── CustomerSearch.jsx
│   │   ├── order/                    # Order components
│   │   │   ├── OrderForm.jsx
│   │   │   ├── OrderList.jsx
│   │   │   ├── OrderDetails.jsx
│   │   │   ├── OrderStatusTimeline.jsx
│   │   │   ├── OrderItemsList.jsx
│   │   │   └── ReturnRequestForm.jsx
│   │   └── complaint/                # Complaint components
│   │       ├── ComplaintForm.jsx
│   │       ├── ComplaintList.jsx
│   │       ├── ComplaintDetails.jsx
│   │       ├── CommentThread.jsx
│   │       └── AddCommentForm.jsx
│   ├── contexts/                     # React Context providers
│   │   ├── AuthContext.jsx           # Authentication state
│   │   ├── ThemeContext.jsx          # Light/Dark mode toggle
│   │   ├── ToastContext.jsx          # Toast notifications
│   │   └── ServiceHealthContext.jsx  # Backend health monitoring
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.js                # Authentication hook
│   │   ├── useAxios.js               # Axios hook with error handling
│   │   ├── useDebounce.js            # Debounce hook for search
│   │   ├── usePagination.js          # Pagination hook
│   │   └── useServiceHealth.js       # Service health check hook
│   ├── pages/                        # Page components
│   │   ├── Home/
│   │   │   └── HomePage.jsx
│   │   ├── Auth/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   └── ResetPasswordPage.jsx
│   │   ├── Dashboard/
│   │   │   ├── CustomerDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── Customer/
│   │   │   ├── MyProfilePage.jsx
│   │   │   ├── EditProfilePage.jsx
│   │   │   ├── CustomerListPage.jsx  # Admin only
│   │   │   └── CustomerDetailsPage.jsx # Admin only
│   │   ├── Order/
│   │   │   ├── CreateOrderPage.jsx
│   │   │   ├── MyOrdersPage.jsx
│   │   │   ├── OrderDetailsPage.jsx
│   │   │   └── AllOrdersPage.jsx     # Admin only
│   │   ├── Complaint/
│   │   │   ├── CreateComplaintPage.jsx
│   │   │   ├── MyComplaintsPage.jsx
│   │   │   ├── ComplaintDetailsPage.jsx
│   │   │   └── AllComplaintsPage.jsx # Admin only
│   │   └── Error/
│   │       ├── NotFoundPage.jsx
│   │       └── UnauthorizedPage.jsx
│   ├── styles/                       # Style configurations
│   │   ├── theme.js                  # MUI theme configuration
│   │   └── globalStyles.js           # Global CSS styles
│   ├── utils/                        # Utility functions
│   │   ├── validators.js             # Form validators
│   │   ├── formatters.js             # Data formatters (dates, currency)
│   │   ├── constants.js              # App constants
│   │   ├── tokenManager.js           # JWT token management
│   │   └── errorHandler.js           # Error handling utilities
│   ├── App.jsx                       # Root component
│   ├── App.test.js                   # App tests
│   ├── index.js                      # Entry point
│   └── setupTests.js                 # Test configuration
├── .env.development                  # Development environment variables
├── .env.production                   # Production environment variables
├── .gitignore
├── package.json
└── README.md
```

---

## 3. Theme Configuration

### Material-UI Theme Setup

The application will support two themes based on the provided color schemes:

#### Corporate Blue (Light Mode)

```javascript
// Theme colors from recommended-theme-guides.md
const lightTheme = {
  palette: {
    mode: 'light',
    primary: {
      main: '#303F9F', // Indigo Dark Blue
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#7C3AED',
      contrastText: '#FFFFFF'
    },
    accent: {
      main: '#F59E0B',
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#1E293B',
      secondary: '#475569'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em' },
    body1: { fontSize: '0.875rem', lineHeight: 1.6 },
    body2: { fontSize: '0.75rem', lineHeight: 1.5 },
    button: { fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.01em' }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: '6px', padding: '12px 24px', textTransform: 'none' }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: { 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '6px'
          }
        }
      }
    }
  },
  spacing: 4 // Base unit: 4px
};
```

#### Dark Mode Pro (Dark Mode)

```javascript
const darkTheme = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#60A5FA',
      contrastText: '#0F172A'
    },
    secondary: {
      main: '#A78BFA',
      contrastText: '#0F172A'
    },
    accent: {
      main: '#FCD34D',
      contrastText: '#0F172A'
    },
    background: {
      default: '#0F172A',
      paper: '#1E293B'
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#CBD5E1'
    },
    divider: '#334155'
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.75rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.625rem', fontWeight: 500, letterSpacing: '-0.01em' },
    body1: { fontSize: '0.875rem', lineHeight: 1.7 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
    button: { fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.01em' }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: '6px', padding: '12px 24px', textTransform: 'none' }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: { 
          borderRadius: '8px',
          border: '1px solid #334155',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '6px',
            backgroundColor: '#1E293B'
          }
        }
      }
    }
  },
  spacing: 4
};
```

### Theme Toggle Implementation

Users can switch between light and dark mode via a toggle in the top navigation bar.

---

## 4. Application Architecture

### Context Providers Hierarchy

```
<App>
  <ThemeContext.Provider>           // Light/Dark mode
    <AuthContext.Provider>          // Authentication state
      <ServiceHealthContext.Provider>  // Backend health
        <ToastContext.Provider>     // Global notifications
          <Router>
            <Routes />
          </Router>
        </ToastContext.Provider>
      </ServiceHealthContext.Provider>
    </AuthContext.Provider>
  </ThemeContext.Provider>
</App>
```

### State Management Strategy

#### AuthContext
- **State:** `{ user, accessToken, refreshToken, isAuthenticated, isLoading }`
- **Actions:** `login(), register(), logout(), refreshToken(), updateProfile()`

#### ThemeContext
- **State:** `{ mode, toggleTheme }`
- **Persistence:** localStorage

#### ServiceHealthContext
- **State:** `{ aths, crms, orms, cmps, lastChecked }`
- **Actions:** `checkHealth()`
- **Polling:** Every 60 seconds

#### ToastContext
- **State:** `{ toasts: [] }`
- **Actions:** `showSuccess(), showError(), showWarning(), showInfo(), dismiss()`

---

## 5. Phased Implementation Plan

### **Phase 1: Project Setup & Authentication** (Week 1)
**Priority:** CRITICAL  
**Estimated Time:** 5-7 days

#### Deliverables:
1. ✅ Create React App setup with Node v22
2. ✅ Install and configure all dependencies
3. ✅ Setup Material-UI theme configuration (light + dark)
4. ✅ Configure environment variables (.env files)
5. ✅ Setup Axios instance with base configuration
6. ✅ Create project folder structure
7. ✅ Implement AuthContext with token management
8. ✅ Implement ThemeContext with localStorage persistence
9. ✅ Create TopNavigation component (header with menu)
10. ✅ Create MainLayout and AuthLayout components
11. ✅ Setup React Router with basic routes
12. ✅ Create LoginPage with LoginForm
13. ✅ Create RegisterPage with RegisterForm
14. ✅ Implement ProtectedRoute component
15. ✅ Create LoadingSpinner component
16. ✅ Create ToastNotification component
17. ✅ Implement token refresh mechanism in Axios interceptors
18. ✅ Create ForgotPasswordPage and ResetPasswordPage

#### Components to Build:
- `src/contexts/AuthContext.jsx`
- `src/contexts/ThemeContext.jsx`
- `src/contexts/ToastContext.jsx`
- `src/api/axios-instance.js`
- `src/api/interceptors.js`
- `src/api/auth.api.js`
- `src/components/common/Layout/MainLayout.jsx`
- `src/components/common/Layout/AuthLayout.jsx`
- `src/components/common/AppBar/TopNavigation.jsx`
- `src/components/common/ProtectedRoute/ProtectedRoute.jsx`
- `src/components/auth/LoginForm.jsx`
- `src/components/auth/RegisterForm.jsx`
- `src/pages/Auth/LoginPage.jsx`
- `src/pages/Auth/RegisterPage.jsx`
- `src/utils/tokenManager.js`
- `src/utils/validators.js`
- `src/styles/theme.js`

#### API Integration:
- `POST /api/auth/register` (ATHS)
- `POST /api/auth/login` (ATHS)
- `POST /api/auth/refresh-token` (ATHS)
- `POST /api/auth/logout` (ATHS)
- `POST /api/auth/forgot-password` (ATHS)
- `POST /api/auth/reset-password` (ATHS)

#### Success Criteria:
- ✅ User can register with validation
- ✅ User can login and receive tokens
- ✅ Tokens stored securely in localStorage
- ✅ Automatic token refresh on 401 errors
- ✅ Protected routes redirect to login if not authenticated
- ✅ Theme toggle switches between light/dark mode
- ✅ Toast notifications work for success/error messages
- ✅ Top navigation displays correctly with menu items

---

### **Phase 2: Home Page & Service Health** (Week 1-2)
**Priority:** HIGH  
**Estimated Time:** 2-3 days

#### Deliverables:
1. ✅ Create HomePage with application features showcase
2. ✅ Implement ServiceHealthContext
3. ✅ Create ServiceHealth indicator component
4. ✅ Add UserMenu dropdown in TopNavigation
5. ✅ Create health check API integration
6. ✅ Add auto-refresh for health status (60s interval)

#### Components to Build:
- `src/pages/Home/HomePage.jsx`
- `src/contexts/ServiceHealthContext.jsx`
- `src/components/common/AppBar/ServiceHealth.jsx`
- `src/components/common/AppBar/UserMenu.jsx`
- `src/api/endpoints.js`

#### API Integration:
- `GET /health` (ATHS)
- `GET /health` (CRMS - if available)
- `GET /health` (ORMS - if available)
- `GET /health` (CMPS - if available)

#### Success Criteria:
- ✅ HomePage displays application features and welcome message
- ✅ Service health indicators show real-time status
- ✅ UserMenu displays user info and logout option
- ✅ Health status updates every 60 seconds

---

### **Phase 3: Customer Profile & Dashboard** (Week 2)
**Priority:** HIGH  
**Estimated Time:** 4-5 days

#### Deliverables:
1. ✅ Create CustomerDashboard for authenticated customers
2. ✅ Create MyProfilePage to view customer profile
3. ✅ Create EditProfilePage to update profile
4. ✅ Create CustomerStatistics component
5. ✅ Implement customer.api.js for CRMS integration
6. ✅ Add profile update functionality
7. ✅ Add ChangePassword functionality

#### Components to Build:
- `src/pages/Dashboard/CustomerDashboard.jsx`
- `src/pages/Customer/MyProfilePage.jsx`
- `src/pages/Customer/EditProfilePage.jsx`
- `src/components/customer/CustomerProfile.jsx`
- `src/components/customer/CustomerStatistics.jsx`
- `src/api/customer.api.js`

#### API Integration:
- `GET /api/customers/me` (CRMS)
- `GET /api/customers/me/statistics` (CRMS)
- `PUT /api/user/profile` (ATHS)
- `PUT /api/user/change-password` (ATHS)

#### Success Criteria:
- ✅ Customer dashboard shows profile overview and statistics
- ✅ Customer can view detailed profile information
- ✅ Customer can update profile (name, contact, address)
- ✅ Customer can change password
- ✅ Statistics display correctly (orders, complaints, spending)

---

### **Phase 4: Order Management - Customer Features** (Week 3)
**Priority:** HIGH  
**Estimated Time:** 5-6 days

#### Deliverables:
1. ✅ Create CreateOrderPage with multi-item order form
2. ✅ Create MyOrdersPage with pagination and filtering
3. ✅ Create OrderDetailsPage with status timeline
4. ✅ Implement order cancellation feature
5. ✅ Implement return request feature
6. ✅ Create OrderStatusTimeline component
7. ✅ Create OrderItemsList component
8. ✅ Implement order.api.js for ORMS integration

#### Components to Build:
- `src/pages/Order/CreateOrderPage.jsx`
- `src/pages/Order/MyOrdersPage.jsx`
- `src/pages/Order/OrderDetailsPage.jsx`
- `src/components/order/OrderForm.jsx`
- `src/components/order/OrderList.jsx`
- `src/components/order/OrderDetails.jsx`
- `src/components/order/OrderStatusTimeline.jsx`
- `src/components/order/OrderItemsList.jsx`
- `src/components/order/ReturnRequestForm.jsx`
- `src/api/order.api.js`

#### API Integration:
- `POST /api/orders` (ORMS)
- `GET /api/orders/me` (ORMS)
- `GET /api/orders/{orderId}` (ORMS)
- `POST /api/orders/{orderId}/cancel` (ORMS)
- `POST /api/orders/{orderId}/return` (ORMS)
- `GET /api/orders/{orderId}/history` (ORMS)

#### Success Criteria:
- ✅ Customer can create orders with multiple items
- ✅ Delivery address form validates correctly
- ✅ Customer can view paginated order history
- ✅ Customer can filter orders by status
- ✅ Customer can view detailed order information
- ✅ Order status timeline displays correctly
- ✅ Customer can cancel orders (only Placed/Processing status)
- ✅ Customer can request returns (only Delivered status)
- ✅ Proper validation for cancellation and return business rules

---

### **Phase 5: Complaint Management - Customer Features** (Week 4)
**Priority:** HIGH  
**Estimated Time:** 4-5 days

#### Deliverables:
1. ✅ Create CreateComplaintPage (order-linked and general)
2. ✅ Create MyComplaintsPage with filtering
3. ✅ Create ComplaintDetailsPage
4. ✅ Implement comment thread feature
5. ✅ Implement add comment functionality
6. ✅ Create ComplaintForm with category/priority selection
7. ✅ Implement complaint.api.js for CMPS integration

#### Components to Build:
- `src/pages/Complaint/CreateComplaintPage.jsx`
- `src/pages/Complaint/MyComplaintsPage.jsx`
- `src/pages/Complaint/ComplaintDetailsPage.jsx`
- `src/components/complaint/ComplaintForm.jsx`
- `src/components/complaint/ComplaintList.jsx`
- `src/components/complaint/ComplaintDetails.jsx`
- `src/components/complaint/CommentThread.jsx`
- `src/components/complaint/AddCommentForm.jsx`
- `src/api/complaint.api.js`

#### API Integration:
- `POST /api/complaints` (CMPS)
- `GET /api/complaints/me` (CMPS)
- `GET /api/complaints/{complaintId}` (CMPS)
- `POST /api/complaints/{complaintId}/comments` (CMPS)
- `GET /api/complaints/{complaintId}/comments` (CMPS)

#### Success Criteria:
- ✅ Customer can create order-linked complaints
- ✅ Customer can create general complaints
- ✅ Form validates category, subject, description
- ✅ Customer can view complaint history with filters
- ✅ Customer can view complaint details
- ✅ Comment thread displays chronologically
- ✅ Customer can add comments to complaints
- ✅ Priority and status badges display correctly

---

### **Phase 6: Admin Dashboard & Analytics** (Week 5)
**Priority:** HIGH  
**Estimated Time:** 5-6 days

#### Deliverables:
1. ✅ Create AdminDashboard with comprehensive analytics
2. ✅ Display overall statistics (customers, orders, complaints)
3. ✅ Create data visualization charts (optional: Chart.js or Recharts)
4. ✅ Add quick action buttons
5. ✅ Display recent activity feed
6. ✅ Implement role-based routing (admin vs customer)

#### Components to Build:
- `src/pages/Dashboard/AdminDashboard.jsx`
- `src/components/admin/StatisticsCards.jsx`
- `src/components/admin/RecentActivity.jsx`
- `src/components/admin/QuickActions.jsx`

#### API Integration:
- `GET /api/admin/stats` (ATHS)
- `GET /api/customers/analytics` (CRMS)
- `GET /api/admin/orders/analytics` (ORMS)
- `GET /api/admin/complaints/analytics` (CMPS - if available)

#### Success Criteria:
- ✅ Admin dashboard shows comprehensive statistics
- ✅ Charts display data trends (if implemented)
- ✅ Quick actions navigate to relevant sections
- ✅ Recent activity shows latest orders/complaints
- ✅ Dashboard layout is responsive

---

### **Phase 7: Admin - Customer Management** (Week 6)
**Priority:** HIGH  
**Estimated Time:** 4-5 days

#### Deliverables:
1. ✅ Create CustomerListPage (admin) with search and filters
2. ✅ Create CustomerDetailsPage (admin) with full information
3. ✅ Implement customer search functionality
4. ✅ Implement customer status update (Active/Inactive/Suspended)
5. ✅ Implement customer type update (Regular/Premium/VIP)
6. ✅ Implement add customer notes feature
7. ✅ Add customer delete functionality (with confirmation)

#### Components to Build:
- `src/pages/Customer/CustomerListPage.jsx`
- `src/pages/Customer/CustomerDetailsPage.jsx`
- `src/components/customer/CustomerList.jsx`
- `src/components/customer/CustomerDetails.jsx`
- `src/components/customer/CustomerSearch.jsx`
- `src/components/common/ConfirmDialog/ConfirmDialog.jsx`

#### API Integration:
- `GET /api/customers` (CRMS - Admin)
- `GET /api/customers/search` (CRMS - Admin)
- `GET /api/customers/{customerId}` (CRMS - Admin)
- `PUT /api/customers/{customerId}` (CRMS - Admin)
- `PATCH /api/customers/{customerId}/status` (CRMS - Admin)
- `PATCH /api/customers/{customerId}/type` (CRMS - Admin)
- `POST /api/customers/{customerId}/notes` (CRMS - Admin)
- `DELETE /api/customers/{customerId}` (CRMS - Admin)

#### Success Criteria:
- ✅ Admin can view paginated customer list
- ✅ Admin can search customers by name/email/phone
- ✅ Admin can filter by status and customer type
- ✅ Admin can view detailed customer information
- ✅ Admin can update customer status
- ✅ Admin can change customer type
- ✅ Admin can add notes to customer profile
- ✅ Admin can delete customers (with validation)
- ✅ Confirmation dialog appears for destructive actions

---

### **Phase 8: Admin - Order Management** (Week 6-7)
**Priority:** HIGH  
**Estimated Time:** 4-5 days

#### Deliverables:
1. ✅ Create AllOrdersPage (admin) with advanced filters
2. ✅ Implement order status update functionality
3. ✅ Add order search by ID, customer, date range
4. ✅ Display order history/timeline
5. ✅ Implement return request approval/rejection
6. ✅ Add tracking number input for shipped orders

#### Components to Build:
- `src/pages/Order/AllOrdersPage.jsx`
- `src/components/admin/OrderFilters.jsx`
- `src/components/admin/UpdateOrderStatusDialog.jsx`
- `src/components/admin/OrderHistoryTimeline.jsx`

#### API Integration:
- `GET /api/admin/orders` (ORMS - Admin)
- `GET /api/admin/orders/{orderId}` (ORMS - Admin)
- `PATCH /api/admin/orders/{orderId}/status` (ORMS - Admin)
- `GET /api/admin/orders/{orderId}/history` (ORMS - Admin)
- `GET /api/admin/orders/analytics` (ORMS - Admin)

#### Success Criteria:
- ✅ Admin can view all orders with pagination
- ✅ Admin can filter by status, date range, customer
- ✅ Admin can search orders by ID
- ✅ Admin can update order status with notes
- ✅ Admin can add tracking numbers for shipped orders
- ✅ Order history displays all status changes
- ✅ Validation prevents invalid status transitions

---

### **Phase 9: Admin - Complaint Management** (Week 7)
**Priority:** HIGH  
**Estimated Time:** 4-5 days

#### Deliverables:
1. ✅ Create AllComplaintsPage (admin) with filters
2. ✅ Implement complaint search functionality
3. ✅ Implement complaint assignment feature
4. ✅ Implement complaint status update
5. ✅ Implement resolve complaint with notes
6. ✅ Implement close and reopen complaint features
7. ✅ Add admin comment functionality

#### Components to Build:
- `src/pages/Complaint/AllComplaintsPage.jsx`
- `src/components/admin/ComplaintFilters.jsx`
- `src/components/admin/AssignComplaintDialog.jsx`
- `src/components/admin/ResolveComplaintDialog.jsx`

#### API Integration:
- `GET /api/complaints` (CMPS - Admin)
- `GET /api/complaints/search` (CMPS - Admin)
- `PATCH /api/complaints/{complaintId}/assign` (CMPS - Admin)
- `PATCH /api/complaints/{complaintId}/status` (CMPS - Admin)
- `POST /api/complaints/{complaintId}/resolve` (CMPS - Admin)
- `POST /api/complaints/{complaintId}/close` (CMPS - Admin)
- `POST /api/complaints/{complaintId}/reopen` (CMPS - Admin)

#### Success Criteria:
- ✅ Admin can view all complaints with pagination
- ✅ Admin can filter by status, category, priority
- ✅ Admin can search by complaint ID, customer, order
- ✅ Admin can assign complaints to team members
- ✅ Admin can update complaint status
- ✅ Admin can resolve with resolution notes
- ✅ Admin can close resolved complaints
- ✅ Admin can reopen closed complaints
- ✅ Admin can add comments to complaints

---

### **Phase 10: Enhanced UX & Polish** (Week 8)
**Priority:** MEDIUM  
**Estimated Time:** 5-6 days

#### Deliverables:
1. ✅ Add loading skeletons for all list views
2. ✅ Implement optimistic UI updates
3. ✅ Add form validation error messages
4. ✅ Implement responsive design for mobile/tablet
5. ✅ Add data export functionality (CSV/Excel)
6. ✅ Implement advanced search with autocomplete
7. ✅ Add keyboard shortcuts for common actions
8. ✅ Improve accessibility (ARIA labels, focus management)
9. ✅ Add empty states for all lists
10. ✅ Implement pagination controls improvement

#### Components to Build:
- `src/components/common/Skeleton/ListSkeleton.jsx`
- `src/components/common/EmptyState/EmptyState.jsx`
- `src/components/common/ExportButton/ExportButton.jsx`
- `src/hooks/useDebounce.js`
- `src/utils/exportUtils.js`

#### Improvements:
- Loading states with Material-UI Skeleton
- Better error messages with field-level validation
- Responsive breakpoints for all pages
- Export buttons for orders/complaints/customers
- Debounced search inputs
- Keyboard navigation support
- WCAG AA compliance

#### Success Criteria:
- ✅ All pages are responsive (mobile, tablet, desktop)
- ✅ Loading states provide smooth UX
- ✅ Form validation is clear and helpful
- ✅ Empty states guide users appropriately
- ✅ Export functionality works for data tables
- ✅ Keyboard navigation works for forms
- ✅ Screen readers can navigate the application

---

### **Phase 11: Testing & Quality Assurance** (Week 9)
**Priority:** MEDIUM  
**Estimated Time:** 5-6 days

#### Deliverables:
1. ✅ Unit tests for utility functions
2. ✅ Component tests for key components
3. ✅ Integration tests for user flows
4. ✅ E2E tests for critical journeys (optional: Cypress)
5. ✅ Cross-browser testing
6. ✅ Performance optimization
7. ✅ Code splitting and lazy loading
8. ✅ SEO optimization
9. ✅ Security audit (XSS, CSRF prevention)

#### Testing Strategy:
- **Unit Tests:** validators, formatters, utilities
- **Component Tests:** Forms, dialogs, lists
- **Integration Tests:** Login flow, order creation, complaint filing
- **E2E Tests:** Customer journey, admin workflow

#### Tools:
- Jest (unit testing)
- React Testing Library (component testing)
- Cypress (E2E - optional)

#### Performance Optimization:
- Code splitting with React.lazy()
- Route-based lazy loading
- Image optimization
- Bundle size analysis
- Memoization for expensive computations

#### Success Criteria:
- ✅ 80%+ test coverage for critical paths
- ✅ All user flows tested
- ✅ No console errors or warnings
- ✅ Lighthouse score > 90 (Performance, Accessibility)
- ✅ Bundle size optimized
- ✅ Application works on Chrome, Firefox, Safari, Edge

---

### **Phase 12: Documentation & Deployment** (Week 9-10)
**Priority:** MEDIUM  
**Estimated Time:** 3-4 days

#### Deliverables:
1. ✅ Create user documentation
2. ✅ Create developer documentation
3. ✅ Setup build configuration for production
4. ✅ Environment variable documentation
5. ✅ Deployment guide (Netlify/Vercel/AWS)
6. ✅ CI/CD pipeline setup (GitHub Actions)
7. ✅ Error monitoring setup (Sentry - optional)
8. ✅ Analytics setup (Google Analytics - optional)

#### Documentation:
- User guide for customers
- User guide for administrators
- API integration documentation
- Component library documentation
- Troubleshooting guide

#### Deployment:
- Production build optimization
- Environment configuration
- Hosting setup (recommendation: Vercel/Netlify)
- Domain configuration
- SSL certificate setup

#### Success Criteria:
- ✅ Documentation is complete and accessible
- ✅ Production build runs successfully
- ✅ Application deployed to hosting platform
- ✅ Environment variables configured correctly
- ✅ CI/CD pipeline automates deployment
- ✅ Error monitoring captures production issues

---

## 6. Component Breakdown

### Layout Components

#### TopNavigation (AppBar)
**File:** `src/components/common/AppBar/TopNavigation.jsx`

**Features:**
- Application logo (left)
- Navigation menu items: Home, Dashboard, Customers, Orders, Complaints
- User menu dropdown (right)
- Service health indicator (right)
- Theme toggle switch (light/dark)

**Visibility Rules:**
- **Home:** Always visible
- **Dashboard:** Visible when authenticated
- **Customers:** Visible to Admin only (shows "My Profile" for customers)
- **Orders:** Visible when authenticated (shows "My Orders" for customers, "All Orders" for admin)
- **Complaints:** Visible when authenticated (shows "My Complaints" for customers, "All Complaints" for admin)

**Material-UI Components:**
- AppBar
- Toolbar
- Button
- IconButton
- Menu
- MenuItem
- Switch

#### UserMenu
**File:** `src/components/common/AppBar/UserMenu.jsx`

**Features:**
- User avatar/initials
- Display user name and role
- Dropdown menu:
  - My Profile
  - Change Password
  - Logout

**Material-UI Components:**
- Avatar
- Menu
- MenuItem
- Divider

#### ServiceHealth
**File:** `src/components/common/AppBar/ServiceHealth.jsx`

**Features:**
- Display health status of all 4 services (ATHS, CRMS, ORMS, CMPS)
- Color-coded indicators:
  - Green: Healthy
  - Yellow: Degraded
  - Red: Down
- Tooltip showing last check time
- Auto-refresh every 60 seconds

**Material-UI Components:**
- Chip
- Tooltip
- Box

---

### Form Components

#### LoginForm
**File:** `src/components/auth/LoginForm.jsx`

**Fields:**
- Email (required, email validation)
- Password (required, min 8 chars)

**Features:**
- React Hook Form validation
- Show/hide password toggle
- Remember me checkbox (optional)
- Error display for invalid credentials
- Loading state during submission
- Link to Forgot Password

**Material-UI Components:**
- TextField
- Button
- IconButton (visibility toggle)
- Link
- Checkbox

#### RegisterForm
**File:** `src/components/auth/RegisterForm.jsx`

**Fields:**
- Email (required, email validation, unique)
- Password (required, min 8 chars, complexity rules)
- Confirm Password (required, must match)
- Full Name (required, min 2 chars)
- Contact Number (optional, phone validation)

**Features:**
- Real-time validation
- Password strength indicator
- Error display
- Terms & conditions checkbox
- Loading state

**Material-UI Components:**
- TextField
- Button
- Checkbox
- LinearProgress (password strength)

#### OrderForm
**File:** `src/components/order/OrderForm.jsx`

**Sections:**
1. **Order Items** (dynamic array)
   - Product ID
   - Product Name
   - SKU
   - Quantity
   - Unit Price
   - Discount (optional)
   - Tax (optional)
   - Description (optional)
   - Add/Remove item buttons

2. **Delivery Address**
   - Full Name
   - Phone Number
   - Address Line 1
   - Address Line 2 (optional)
   - City
   - State
   - Postal Code
   - Country
   - Landmark (optional)

3. **Order Notes** (optional)

**Features:**
- Dynamic item array management
- Real-time total calculation
- Multi-step wizard (optional)
- Validation per section
- Save as draft (optional)

**Material-UI Components:**
- TextField
- Button
- IconButton
- Stepper (if wizard)
- Grid
- Divider

#### ComplaintForm
**File:** `src/components/complaint/ComplaintForm.jsx`

**Fields:**
- Order ID (optional, autocomplete from customer's orders)
- Category (dropdown: Product Quality, Delivery Issue, Customer Service, Payment Issue, Return/Refund, Website/App Issue, Other)
- Subject (required, 5-200 chars)
- Description (required, 20-2000 chars, multiline)
- Priority (dropdown: Low, Medium, High, Critical)
- Tags (optional, chip input)

**Features:**
- Conditional order selection
- Character counter for description
- Tag management
- File upload placeholder (for future)
- Preview before submit

**Material-UI Components:**
- TextField
- Select
- MenuItem
- Chip
- Autocomplete

---

### List Components

#### OrderList
**File:** `src/components/order/OrderList.jsx`

**Features:**
- Paginated table/card view
- Columns:
  - Order ID
  - Order Date
  - Total Amount
  - Status (chip with color coding)
  - Actions (View Details, Cancel if applicable)
- Status filter dropdown
- Date range filter
- Search by order ID
- Sort by date, amount

**Material-UI Components:**
- Table / Card (responsive)
- TablePagination
- Select (filters)
- TextField (search)
- Chip (status badges)
- Button (actions)

#### ComplaintList
**File:** `src/components/complaint/ComplaintList.jsx`

**Features:**
- Paginated list
- Columns:
  - Complaint ID
  - Order ID (if linked)
  - Subject
  - Category
  - Status
  - Priority
  - Created Date
  - Actions
- Filters: Status, Category, Priority
- Search by complaint ID, subject
- Sort by date, priority

**Material-UI Components:**
- Table / Card
- TablePagination
- Select
- TextField
- Chip
- Button

#### CustomerList (Admin)
**File:** `src/components/customer/CustomerList.jsx`

**Features:**
- Paginated table
- Columns:
  - Customer ID
  - Name
  - Email
  - Phone
  - Customer Type
  - Status
  - Registration Date
  - Actions
- Search by name, email, phone
- Filters: Status, Customer Type
- Sort by name, date

**Material-UI Components:**
- Table
- TablePagination
- TextField
- Select
- Chip
- Button

---

### Detail/Display Components

#### OrderDetails
**File:** `src/components/order/OrderDetails.jsx`

**Sections:**
- Order Information (ID, Date, Status, Total)
- Customer Information
- Delivery Address
- Order Items Table
- Order Status Timeline
- Actions (Cancel, Request Return)

**Material-UI Components:**
- Card
- Grid
- Table
- Button
- Chip
- Divider

#### ComplaintDetails
**File:** `src/components/complaint/ComplaintDetails.jsx`

**Sections:**
- Complaint Information (ID, Status, Category, Priority)
- Related Order (if linked)
- Customer Information
- Description
- Comment Thread
- Add Comment Form
- Admin Actions (if admin: Assign, Update Status, Resolve)

**Material-UI Components:**
- Card
- Grid
- Chip
- Button
- Divider

#### OrderStatusTimeline
**File:** `src/components/order/OrderStatusTimeline.jsx`

**Features:**
- Vertical timeline showing status progression
- Each step shows:
  - Status name
  - Timestamp
  - Changed by (admin name if applicable)
  - Notes (if any)
- Color coding for each status
- Current status highlighted

**Material-UI Components:**
- Timeline
- TimelineItem
- TimelineSeparator
- TimelineConnector
- TimelineDot
- TimelineContent

---

## 7. Context Providers

### AuthContext

**File:** `src/contexts/AuthContext.jsx`

**State:**
```javascript
{
  user: {
    userId: string,
    email: string,
    fullName: string,
    role: 'Customer' | 'Administrator',
    isActive: boolean,
    isEmailVerified: boolean
  },
  accessToken: string | null,
  refreshToken: string | null,
  isAuthenticated: boolean,
  isLoading: boolean
}
```

**Methods:**
- `login(email, password)` - Login user
- `register(userData)` - Register new user
- `logout()` - Logout and clear tokens
- `refreshAccessToken()` - Refresh access token
- `updateUserProfile(userData)` - Update user info
- `checkAuthStatus()` - Verify token validity

**Persistence:**
- Store tokens in localStorage
- Clear on logout
- Restore on app initialization

---

### ThemeContext

**File:** `src/contexts/ThemeContext.jsx`

**State:**
```javascript
{
  mode: 'light' | 'dark',
  theme: MuiThemeObject
}
```

**Methods:**
- `toggleTheme()` - Switch between light/dark
- `setTheme(mode)` - Set specific theme

**Persistence:**
- Store preference in localStorage
- Apply on mount

---

### ServiceHealthContext

**File:** `src/contexts/ServiceHealthContext.jsx`

**State:**
```javascript
{
  services: {
    aths: { status: 'healthy' | 'degraded' | 'down', lastChecked: timestamp },
    crms: { status: 'healthy' | 'degraded' | 'down', lastChecked: timestamp },
    orms: { status: 'healthy' | 'degraded' | 'down', lastChecked: timestamp },
    cmps: { status: 'healthy' | 'degraded' | 'down', lastChecked: timestamp }
  },
  isChecking: boolean
}
```

**Methods:**
- `checkHealth()` - Ping all services
- `checkServiceHealth(serviceName)` - Check specific service

**Auto-refresh:**
- Poll every 60 seconds when user is authenticated
- Clear interval on logout

---

### ToastContext

**File:** `src/contexts/ToastContext.jsx`

**State:**
```javascript
{
  toasts: [
    { id: string, message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number }
  ]
}
```

**Methods:**
- `showSuccess(message, duration = 3000)`
- `showError(message, duration = 5000)`
- `showWarning(message, duration = 4000)`
- `showInfo(message, duration = 3000)`
- `dismissToast(id)`

**Features:**
- Auto-dismiss after duration
- Multiple toasts stacked
- Material-UI Snackbar integration

---

## 8. Routing Strategy

### Route Structure

```javascript
// Public Routes
/                           → HomePage
/login                      → LoginPage
/register                   → RegisterPage
/forgot-password            → ForgotPasswordPage
/reset-password/:token      → ResetPasswordPage

// Protected Routes (Customer & Admin)
/dashboard                  → CustomerDashboard (customer) / AdminDashboard (admin)

// Customer Routes
/profile                    → MyProfilePage
/profile/edit               → EditProfilePage
/orders/create              → CreateOrderPage
/orders                     → MyOrdersPage
/orders/:orderId            → OrderDetailsPage
/complaints/create          → CreateComplaintPage
/complaints                 → MyComplaintsPage
/complaints/:complaintId    → ComplaintDetailsPage

// Admin Only Routes
/admin/customers            → CustomerListPage
/admin/customers/:customerId → CustomerDetailsPage
/admin/orders               → AllOrdersPage
/admin/complaints           → AllComplaintsPage

// Error Routes
/unauthorized               → UnauthorizedPage
*                          → NotFoundPage
```

### ProtectedRoute Component

**Features:**
- Check authentication status
- Redirect to login if not authenticated
- Role-based access control
- Redirect to unauthorized page if insufficient permissions

**Usage:**
```javascript
<Route 
  path="/admin/customers" 
  element={
    <ProtectedRoute requiredRole="Administrator">
      <CustomerListPage />
    </ProtectedRoute>
  } 
/>
```

---

## 9. API Integration Patterns

### Axios Instance Configuration

**File:** `src/api/axios-instance.js`

**Base Configuration:**
```javascript
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

**Service-Specific Instances:**
```javascript
export const athsAPI = axios.create({ baseURL: process.env.REACT_APP_ATHS_URL });
export const crmsAPI = axios.create({ baseURL: process.env.REACT_APP_CRMS_URL });
export const ormsAPI = axios.create({ baseURL: process.env.REACT_APP_ORMS_URL });
export const cmpsAPI = axios.create({ baseURL: process.env.REACT_APP_CMPS_URL });
```

---

### Request Interceptor

**File:** `src/api/interceptors.js`

**Features:**
- Attach access token to all requests
- Handle token expiration
- Automatic retry with refreshed token

**Implementation:**
```javascript
// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Attempt token refresh
      const newAccessToken = await refreshAccessToken();
      
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      }
      
      // If refresh fails, logout
      logout();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);
```

---

### API Service Files

#### auth.api.js
```javascript
export const authAPI = {
  register: (userData) => athsAPI.post('/api/auth/register', userData),
  login: (credentials) => athsAPI.post('/api/auth/login', credentials),
  logout: (refreshToken) => athsAPI.post('/api/auth/logout', { refreshToken }),
  refreshToken: (refreshToken) => athsAPI.post('/api/auth/refresh-token', { refreshToken }),
  forgotPassword: (email) => athsAPI.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => athsAPI.post('/api/auth/reset-password', { token, newPassword }),
  getUserProfile: () => athsAPI.get('/api/user/profile'),
  updateUserProfile: (userData) => athsAPI.put('/api/user/profile', userData),
  changePassword: (passwords) => athsAPI.put('/api/user/change-password', passwords)
};
```

#### customer.api.js
```javascript
export const customerAPI = {
  getMyProfile: () => crmsAPI.get('/api/customers/me'),
  getMyStatistics: () => crmsAPI.get('/api/customers/me/statistics'),
  
  // Admin endpoints
  getAllCustomers: (params) => crmsAPI.get('/api/customers', { params }),
  searchCustomers: (query, params) => crmsAPI.get('/api/customers/search', { params: { q: query, ...params } }),
  getCustomerById: (customerId) => crmsAPI.get(`/api/customers/${customerId}`),
  updateCustomer: (customerId, data) => crmsAPI.put(`/api/customers/${customerId}`, data),
  updateCustomerStatus: (customerId, status, reason) => crmsAPI.patch(`/api/customers/${customerId}/status`, { status, reason }),
  updateCustomerType: (customerId, customerType, notes) => crmsAPI.patch(`/api/customers/${customerId}/type`, { customerType, notes }),
  addCustomerNote: (customerId, content) => crmsAPI.post(`/api/customers/${customerId}/notes`, { content }),
  deleteCustomer: (customerId) => crmsAPI.delete(`/api/customers/${customerId}`)
};
```

#### order.api.js
```javascript
export const orderAPI = {
  createOrder: (orderData) => ormsAPI.post('/api/orders', orderData),
  getMyOrders: (params) => ormsAPI.get('/api/orders/me', { params }),
  getOrderById: (orderId) => ormsAPI.get(`/api/orders/${orderId}`),
  cancelOrder: (orderId, reason, reasonCategory) => ormsAPI.post(`/api/orders/${orderId}/cancel`, { reason, reasonCategory }),
  requestReturn: (orderId, returnData) => ormsAPI.post(`/api/orders/${orderId}/return`, returnData),
  getOrderHistory: (orderId) => ormsAPI.get(`/api/orders/${orderId}/history`),
  
  // Admin endpoints
  getAllOrders: (params) => ormsAPI.get('/api/admin/orders', { params }),
  updateOrderStatus: (orderId, newStatus, changeReason, trackingNumber) => 
    ormsAPI.patch(`/api/admin/orders/${orderId}/status`, { newStatus, changeReason, trackingNumber }),
  getOrderAnalytics: () => ormsAPI.get('/api/admin/orders/analytics')
};
```

#### complaint.api.js
```javascript
export const complaintAPI = {
  createComplaint: (complaintData) => cmpsAPI.post('/api/complaints', complaintData),
  getMyComplaints: (params) => cmpsAPI.get('/api/complaints/me', { params }),
  getComplaintById: (complaintId) => cmpsAPI.get(`/api/complaints/${complaintId}`),
  addComment: (complaintId, comment, attachments) => 
    cmpsAPI.post(`/api/complaints/${complaintId}/comments`, { comment, attachments }),
  getComments: (complaintId) => cmpsAPI.get(`/api/complaints/${complaintId}/comments`),
  
  // Admin endpoints
  getAllComplaints: (params) => cmpsAPI.get('/api/complaints', { params }),
  searchComplaints: (query, params) => cmpsAPI.get('/api/complaints/search', { params: { q: query, ...params } }),
  assignComplaint: (complaintId, assignTo, notes) => 
    cmpsAPI.patch(`/api/complaints/${complaintId}/assign`, { assignTo, notes }),
  updateComplaintStatus: (complaintId, status) => 
    cmpsAPI.patch(`/api/admin/complaints/${complaintId}/status`, { status }),
  resolveComplaint: (complaintId, resolutionNotes, tags) => 
    cmpsAPI.post(`/api/complaints/${complaintId}/resolve`, { resolutionNotes, tags }),
  closeComplaint: (complaintId, notes) => 
    cmpsAPI.post(`/api/complaints/${complaintId}/close`, { notes }),
  reopenComplaint: (complaintId, reason) => 
    cmpsAPI.post(`/api/complaints/${complaintId}/reopen`, { reason })
};
```

---

### Error Handling Pattern

**File:** `src/utils/errorHandler.js`

```javascript
export const handleAPIError = (error, showToast) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        showToast('error', data.message || 'Bad request');
        break;
      case 401:
        showToast('error', 'Session expired. Please login again.');
        // Handled by interceptor
        break;
      case 403:
        showToast('error', 'You do not have permission to perform this action.');
        break;
      case 404:
        showToast('error', data.message || 'Resource not found');
        break;
      case 409:
        showToast('error', data.message || 'Conflict occurred');
        break;
      case 422:
        // Validation errors
        if (data.data?.errors) {
          // Display field-level errors
          return data.data.errors;
        }
        showToast('error', data.message || 'Validation failed');
        break;
      case 500:
        showToast('error', 'Server error. Please try again later.');
        break;
      default:
        showToast('error', 'An unexpected error occurred');
    }
  } else if (error.request) {
    // Request made but no response
    showToast('error', 'Network error. Please check your connection.');
  } else {
    // Something else happened
    showToast('error', error.message || 'An error occurred');
  }
};
```

---

## 10. Testing Strategy

### Unit Tests

**Test Files:**
- `src/utils/validators.test.js`
- `src/utils/formatters.test.js`
- `src/utils/tokenManager.test.js`

**Coverage:**
- Email validation
- Password strength validation
- Phone number validation
- Date formatting
- Currency formatting
- Token encoding/decoding

---

### Component Tests

**Test Files:**
- `src/components/auth/LoginForm.test.js`
- `src/components/auth/RegisterForm.test.js`
- `src/components/order/OrderForm.test.js`
- `src/components/complaint/ComplaintForm.test.js`

**Test Cases:**
- Render without errors
- Validate required fields
- Show error messages on invalid input
- Submit with valid data
- Handle API errors

---

### Integration Tests

**Test Scenarios:**
1. **User Registration Flow**
   - Navigate to register page
   - Fill form with valid data
   - Submit and verify redirect to dashboard
   - Verify token storage

2. **Order Creation Flow**
   - Login as customer
   - Navigate to create order
   - Add multiple items
   - Fill delivery address
   - Submit and verify order created

3. **Complaint Filing Flow**
   - Login as customer
   - View orders
   - Select order
   - Create complaint
   - Verify complaint created

4. **Admin Order Management Flow**
   - Login as admin
   - View all orders
   - Update order status
   - Verify status updated

---

### E2E Tests (Optional - Cypress)

**Test Suites:**
1. Complete customer journey (register → order → complaint)
2. Complete admin workflow (manage customer → update order → resolve complaint)
3. Authentication flows (login, logout, token refresh)

---

## Environment Variables

### .env.development

```
REACT_APP_ATHS_URL=http://localhost:5001
REACT_APP_CRMS_URL=http://localhost:5002
REACT_APP_ORMS_URL=http://localhost:5003
REACT_APP_CMPS_URL=http://localhost:5004
REACT_APP_ENV=development
```

### .env.production

```
REACT_APP_ATHS_URL=https://api.tradeease.com/auth
REACT_APP_CRMS_URL=https://api.tradeease.com/customers
REACT_APP_ORMS_URL=https://api.tradeease.com/orders
REACT_APP_CMPS_URL=https://api.tradeease.com/complaints
REACT_APP_ENV=production
```

---

## Build & Deployment

### Build Commands

```bash
# Development
npm start

# Production build
npm run build

# Run tests
npm test

# Test coverage
npm test -- --coverage
```

### Deployment Platforms

**Recommended:**
- **Vercel** - Zero-config deployment for React
- **Netlify** - Easy deployment with CI/CD
- **AWS S3 + CloudFront** - Enterprise solution

### CI/CD Pipeline (GitHub Actions)

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## Summary

This implementation guide provides a **complete roadmap** for building the TradeEase frontend application with:

- ✅ **React 18** with JavaScript
- ✅ **Material-UI** with custom Corporate Blue (light) and Dark Mode Pro (dark) themes
- ✅ **React Context API** for state management
- ✅ **React Hook Form** for form handling
- ✅ **Axios** for API integration with all 4 microservices
- ✅ **React Router** for navigation
- ✅ **Top Navigation** with menu items and user controls
- ✅ **12 phased implementation plan** covering all features
- ✅ **Comprehensive component breakdown**
- ✅ **API integration patterns** for ATHS, CRMS, ORMS, CMPS
- ✅ **Testing strategy** for quality assurance

### Total Timeline: 9-10 weeks

**Next Steps:**
1. Review and approve this implementation guide
2. Confirm technology stack and theme choices
3. Proceed with Phase 1 implementation (Project Setup & Authentication)

---

**Ready to start implementation when you approve this plan!** 🚀
