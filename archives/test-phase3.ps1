# ORMS Phase 3 Testing Script

# First, register a test user (if not exists)
Write-Host "`n=== 0. Register test user ===" -ForegroundColor Cyan
$registerBody = @{
    fullName = "Test Customer"
    email = "testcustomer@example.com"
    password = "Test@123"
    phone = "+1234567890"
    role = "customer"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "User registered successfully!" -ForegroundColor Green
} catch {
    Write-Host "User might already exist (this is OK)" -ForegroundColor Yellow
}

# Login to get a JWT token (using ATHS on port 5001)
Write-Host "`n=== 1. Login to get JWT token ===" -ForegroundColor Cyan
$loginBody = @{
    email = "testcustomer@example.com"
    password = "Test@123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.token
Write-Host "Token obtained: $($token.Substring(0, 20))..." -ForegroundColor Green

# 2. Create an order
Write-Host "`n=== 2. Create a new order ===" -ForegroundColor Cyan
$orderBody = @{
    deliveryAddress = @{
        recipientName = "John Doe"
        street = "123 Main Street"
        city = "New York"
        state = "NY"
        zipCode = "10001"
        country = "USA"
        phone = "+1234567890"
    }
    items = @(
        @{
            productId = "PROD-001"
            productName = "Laptop Computer"
            productDescription = "High-performance laptop"
            sku = "LAP-001"
            quantity = 1
            unitPrice = 999.99
            discount = 50.00
            tax = 80.00
        },
        @{
            productId = "PROD-002"
            productName = "Wireless Mouse"
            productDescription = "Ergonomic wireless mouse"
            sku = "MOU-001"
            quantity = 2
            unitPrice = 29.99
            discount = 0.00
            tax = 5.00
        }
    )
    notes = "Please deliver between 9 AM - 5 PM"
} | ConvertTo-Json -Depth 10

try {
    $createResponse = Invoke-RestMethod -Uri "http://localhost:5003/api/orders" -Method POST -Body $orderBody -ContentType "application/json" -Headers @{Authorization = "Bearer $token"}
    Write-Host "Order created successfully!" -ForegroundColor Green
    Write-Host "Order ID: $($createResponse.data.orderId)" -ForegroundColor Yellow
    $orderId = $createResponse.data.orderId
    Write-Host "Total Amount: `$$($createResponse.data.totalAmount)" -ForegroundColor Yellow
    Write-Host "Status: $($createResponse.data.status)" -ForegroundColor Yellow
    Write-Host "Items: $($createResponse.data.items.Count)" -ForegroundColor Yellow
} catch {
    Write-Host "Error creating order: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.Exception.Response.StatusCode -ForegroundColor Red
    exit
}

# 3. Get my orders list
Write-Host "`n=== 3. Get my orders (paginated) ===" -ForegroundColor Cyan
try {
    $ordersResponse = Invoke-RestMethod -Uri "http://localhost:5003/api/orders/me?page=1&page_size=10" -Method GET -Headers @{Authorization = "Bearer $token"}
    Write-Host "Orders retrieved successfully!" -ForegroundColor Green
    Write-Host "Total orders: $($ordersResponse.data.pagination.total)" -ForegroundColor Yellow
    Write-Host "Current page: $($ordersResponse.data.pagination.page)" -ForegroundColor Yellow
    
    foreach ($order in $ordersResponse.data.items) {
        Write-Host "`n  Order: $($order.orderId)" -ForegroundColor Cyan
        Write-Host "  Status: $($order.status)" -ForegroundColor White
        Write-Host "  Total: `$$($order.totalAmount)" -ForegroundColor White
        Write-Host "  Items: $($order.itemCount)" -ForegroundColor White
    }
} catch {
    Write-Host "Error getting orders: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Get specific order details
Write-Host "`n=== 4. Get order details ===" -ForegroundColor Cyan
try {
    $detailsResponse = Invoke-RestMethod -Uri "http://localhost:5003/api/orders/$orderId" -Method GET -Headers @{Authorization = "Bearer $token"}
    Write-Host "Order details retrieved successfully!" -ForegroundColor Green
    Write-Host "Order ID: $($detailsResponse.data.orderId)" -ForegroundColor Yellow
    Write-Host "Customer: $($detailsResponse.data.customerName)" -ForegroundColor Yellow
    Write-Host "Delivery Address: $($detailsResponse.data.deliveryAddress.street), $($detailsResponse.data.deliveryAddress.city)" -ForegroundColor Yellow
    Write-Host "Subtotal: `$$($detailsResponse.data.subtotal)" -ForegroundColor Yellow
    Write-Host "Discount: `$$($detailsResponse.data.discount)" -ForegroundColor Yellow
    Write-Host "Tax: `$$($detailsResponse.data.tax)" -ForegroundColor Yellow
    Write-Host "Total: `$$($detailsResponse.data.totalAmount)" -ForegroundColor Yellow
    
    Write-Host "`nItems:" -ForegroundColor Cyan
    foreach ($item in $detailsResponse.data.items) {
        Write-Host "  - $($item.productName) x$($item.quantity) = `$$($item.finalPrice)" -ForegroundColor White
    }
} catch {
    Write-Host "Error getting order details: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Testing Complete ===" -ForegroundColor Green
