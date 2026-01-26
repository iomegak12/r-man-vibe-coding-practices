# Order Management Service (ORMS)

**E-Commerce Order Management System**

## Overview

The Order Management Service (ORMS) is responsible for managing the complete order lifecycle in the E-Commerce Customer Management System. Built with Python FastAPI, it handles order creation, tracking, cancellation, returns, and administrative order management.

## Features

- ✅ **Order Creation** - Place orders with multiple items
- ✅ **Order Tracking** - Track order status and history
- ✅ **Order Cancellation** - Cancel orders in Placed/Processing status
- ✅ **Return Management** - Request and approve returns
- ✅ **Admin Management** - Comprehensive order management tools
- ✅ **Service Integration** - Integration with ATHS and CRMS

## Technology Stack

- **Framework**: FastAPI 0.109.0
- **Database**: MongoDB (Motor async driver)
- **Authentication**: JWT
- **Port**: 5003

## Quick Start

### 1. Install Dependencies

```bash
cd back-end/orms
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

### 3. Run Service

```bash
uvicorn app.main:app --reload --port 5003
```

### 4. Access Documentation

- **Swagger UI**: http://localhost:5003/docs
- **Health Check**: http://localhost:5003/health

## Database

- **Database Name**: `r-man-orders-db`
- **Collections**: 
  - `orders` - Main order records
  - `order_items` - Order line items
  - `order_history` - Audit trail
  - `return_requests` - Return management

## API Endpoints

### Customer Endpoints
- `POST /api/orders` - Create order
- `GET /api/orders/me` - Get my orders
- `GET /api/orders/{orderId}` - Get order details
- `POST /api/orders/{orderId}/cancel` - Cancel order
- `POST /api/orders/{orderId}/return` - Request return
- `GET /api/orders/{orderId}/history` - Get order history

### Admin Endpoints
- `GET /api/orders` - List all orders
- `GET /api/orders/search` - Search orders
- `PATCH /api/orders/{orderId}/status` - Update status
- `GET /api/orders/analytics` - Order analytics
- `GET /api/orders/returns` - List return requests
- `PATCH /api/orders/returns/{returnId}/review` - Review return

### Internal Endpoints
- `GET /api/orders/internal/customer/{customerId}` - Get customer orders
- `GET /api/orders/internal/customer/{customerId}/count` - Get order count

## Service Dependencies

- **Auth Service (ATHS)**: Port 5001 - User authentication
- **Customer Service (CRMS)**: Port 5002 - Customer statistics updates

## Order Status Flow

```
Placed → Processing → Shipped → Delivered
   ↓
Cancelled (allowed in Placed/Processing)
   
Delivered → Return Requested → Returned
```

## Development

**Prepared By**: Ramkumar JD  
**Client**: R-MAN Corporation, Bangalore  
**Version**: 1.0.0

---

For detailed implementation guide, see [Order-Service-Implementation-Guide.md](../../docs/Order-Service-Implementation-Guide.md)
