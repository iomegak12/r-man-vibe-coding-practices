# R-MAN Database Seeder

Seeds all microservices databases with sample data for R-MAN E-Commerce platform.

## Features

- ✅ Seeds ATHS (Authentication Service) users
- ✅ Seeds CRMS (Customer Management Service) customers
- ✅ Seeds ORMS (Order Management Service) orders and items
- ✅ Seeds CMPS (Complaint Management Service) complaints and comments
- ✅ Maintains referential integrity across services
- ✅ Uses realistic Indian names, addresses, and product data
- ✅ Configurable force seeding option

## Sample Data

- **5 Admin Users** (including admin@rman.com)
- **10 Customer Users** with profiles
- **100 Orders** (10 per customer)
- **500 Order Items** (5 per order)
- **30 Complaints** (3 per customer, mixed order-linked and general)
- **120 Comments** (4 per complaint)

## Configuration

Edit `.env` file:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://admin:password123@localhost:27017/?authSource=admin

# Seeding Configuration
FORCE_SEEDING=false  # Set to true to clear and re-seed

# Default Password
DEFAULT_PASSWORD=Rman123!
```

## Usage

### Local Development

```bash
# Install dependencies
npm install

# Run seeder
npm run seed
```

### Docker

```bash
# Build image
docker build -t rman-seeder .

# Run seeder
docker run --rm --network r-man-network rman-seeder
```

## Default Login

After seeding, you can login with:

- **Email**: admin@rman.com
- **Password**: Rman123!

All users have the same password: `Rman123!`

## Database Collections

### ATHS (auth_db)
- users
- refreshtokens
- passwordresets

### CRMS (r-man-customers-db)
- customers

### ORMS (r-man-orders-db)
- orders
- order_items
- order_history
- return_requests

### CMPS (complaint_db)
- complaints
- complaint_comments
- complaint_history

## License

Copyright © 2026 R-MAN Corporation
