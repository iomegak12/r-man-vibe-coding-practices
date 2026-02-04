/**
 * R-MAN E-Commerce Database Seeder
 * Seeds all microservices databases with sample data
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { MongoClient } from 'mongodb';
import { getRandomIndianName, getRandomIndianAddress, getRandomIndianPhone } from './data/indian-names.js';
import { getRandomProducts, generateSKU } from './data/products.js';

dotenv.config();

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/?authSource=admin';
const AUTH_DB_NAME = process.env.AUTH_DB_NAME || 'auth_db';
const CUSTOMER_DB_NAME = process.env.CUSTOMER_DB_NAME || 'r-man-customers-db';
const ORDER_DB_NAME = process.env.ORDER_DB_NAME || 'r-man-orders-db';
const COMPLAINT_DB_NAME = process.env.COMPLAINT_DB_NAME || 'complaint_db';
const FORCE_SEEDING = process.env.FORCE_SEEDING === 'true';
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || 'Rman123!';
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

// Seeding Configuration
const ADMIN_COUNT = 5;
const CUSTOMER_COUNT = 10;
const ORDERS_PER_CUSTOMER = 10;
const ITEMS_PER_ORDER = 5;
const COMPLAINTS_PER_CUSTOMER = 3;
const COMMENTS_PER_COMPLAINT = 4;

let client;
let authDb, customerDb, orderDb, complaintDb;

// Helper functions
function log(message, data = null) {
  console.log(`\n📝 ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
}

function success(message) {
  console.log(`\n✅ ${message}`);
}

function error(message, err = null) {
  console.error(`\n❌ ${message}`);
  if (err) console.error(err);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Connect to MongoDB
async function connectDatabase() {
  try {
    log('Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    authDb = client.db(AUTH_DB_NAME);
    customerDb = client.db(CUSTOMER_DB_NAME);
    orderDb = client.db(ORDER_DB_NAME);
    complaintDb = client.db(COMPLAINT_DB_NAME);
    
    success('Connected to MongoDB');
  } catch (err) {
    error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

// Check if data exists
async function checkDataExists() {
  try {
    const usersCount = await authDb.collection('users').countDocuments();
    return usersCount > 0;
  } catch (err) {
    error('Error checking existing data', err);
    return false;
  }
}

// Clear all data
async function clearAllData() {
  try {
    log('Clearing all existing data...');
    
    // ATHS
    await authDb.collection('users').deleteMany({});
    await authDb.collection('refreshtokens').deleteMany({});
    await authDb.collection('passwordresets').deleteMany({});
    
    // CRMS
    await customerDb.collection('customers').deleteMany({});
    
    // ORMS
    await orderDb.collection('orders').deleteMany({});
    await orderDb.collection('order_items').deleteMany({});
    await orderDb.collection('order_history').deleteMany({});
    await orderDb.collection('return_requests').deleteMany({});
    
    // CMPS
    await complaintDb.collection('complaints').deleteMany({});
    await complaintDb.collection('complaint_comments').deleteMany({});
    await complaintDb.collection('complaint_history').deleteMany({});
    
    success('All data cleared');
  } catch (err) {
    error('Error clearing data', err);
    throw err;
  }
}

// Seed ATHS - Users
async function seedUsers() {
  try {
    log(`Seeding ${ADMIN_COUNT} admin users and ${CUSTOMER_COUNT} customer users...`);
    
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, BCRYPT_SALT_ROUNDS);
    const users = [];
    
    // Create admin@rman.com
    users.push({
      email: 'admin@rman.com',
      password: hashedPassword,
      fullName: 'System Administrator',
      contactNumber: '+919876543210',
      address: getRandomIndianAddress(),
      role: 'Administrator',
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Create additional admins
    for (let i = 1; i < ADMIN_COUNT; i++) {
      const name = getRandomIndianName();
      users.push({
        email: `admin${i}@rman.com`,
        password: hashedPassword,
        fullName: name,
        contactNumber: getRandomIndianPhone(),
        address: getRandomIndianAddress(),
        role: 'Administrator',
        isActive: true,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Create customers
    for (let i = 0; i < CUSTOMER_COUNT; i++) {
      const name = getRandomIndianName();
      const email = name.toLowerCase().replace(/\s+/g, '.') + '@gmail.com';
      users.push({
        email,
        password: hashedPassword,
        fullName: name,
        contactNumber: getRandomIndianPhone(),
        address: getRandomIndianAddress(),
        role: 'Customer',
        isActive: Math.random() > 0.1, // 90% active
        emailVerified: Math.random() > 0.2, // 80% verified
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    const result = await authDb.collection('users').insertMany(users);
    success(`Seeded ${result.insertedCount} users`);
    return Object.values(result.insertedIds);
  } catch (err) {
    error('Error seeding users', err);
    throw err;
  }
}

// Seed CRMS - Customers
async function seedCustomers() {
  try {
    log('Seeding customers...');
    
    // Get customer users from ATHS
    const customerUsers = await authDb.collection('users').find({ role: 'Customer' }).toArray();
    const customers = [];
    
    for (const user of customerUsers) {
      const customerSince = randomDate(new Date('2023-01-01'), new Date('2025-12-31'));
      customers.push({
        userId: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        contactNumber: user.contactNumber,
        customerStatus: user.isActive ? 'Active' : 'Inactive',
        customerType: randomChoice(['Regular', 'Premium', 'VIP']),
        totalOrders: 0,
        totalOrderValue: 0.0,
        totalComplaints: 0,
        openComplaints: 0,
        lastOrderDate: null,
        lastComplaintDate: null,
        customerSince,
        notes: null,
        tags: [],
        preferences: {
          newsletter: Math.random() > 0.3,
          notifications: Math.random() > 0.2,
          language: 'en'
        },
        metadata: {
          lastLoginDate: randomDate(new Date('2025-01-01'), new Date()),
          loginCount: randomInt(1, 50),
          lastActivityDate: randomDate(new Date('2025-12-01'), new Date())
        },
        createdAt: customerSince,
        updatedAt: new Date(),
        createdBy: null,
        updatedBy: null
      });
    }
    
    const result = await customerDb.collection('customers').insertMany(customers);
    success(`Seeded ${result.insertedCount} customers`);
    return Object.values(result.insertedIds);
  } catch (err) {
    error('Error seeding customers', err);
    throw err;
  }
}

// Seed ORMS - Orders, Order Items, Order History
async function seedOrders() {
  try {
    log(`Seeding ${ORDERS_PER_CUSTOMER} orders per customer...`);
    
    const customers = await customerDb.collection('customers').find({}).toArray();
    const orderStatuses = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const orders = [];
    const orderItems = [];
    const orderHistory = [];
    let orderCounter = 1;
    
    for (const customer of customers) {
      for (let i = 0; i < ORDERS_PER_CUSTOMER; i++) {
        const orderId = `ORD-2026-${String(orderCounter).padStart(6, '0')}`;
        const orderDate = randomDate(new Date('2025-01-01'), new Date());
        const status = randomChoice(orderStatuses);
        const products = getRandomProducts(ITEMS_PER_ORDER);
        
        let subtotal = 0;
        const orderObjectId = new mongoose.Types.ObjectId();
        
        // Create order items
        products.forEach(product => {
          const quantity = randomInt(1, 3);
          const discount = product.price * 0.1 * Math.random(); // 0-10% discount
          const tax = (product.price - discount) * 0.18; // 18% GST
          const totalPrice = quantity * product.price;
          const finalPrice = quantity * (product.price - discount + tax);
          
          subtotal += totalPrice;
          
          orderItems.push({
            orderId: orderObjectId,
            orderIdString: orderId,
            productId: `PROD-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
            productName: product.name,
            productDescription: `${product.brand} ${product.category}`,
            sku: generateSKU(product.name),
            quantity,
            unitPrice: product.price,
            totalPrice,
            discount: parseFloat((quantity * discount).toFixed(2)),
            tax: parseFloat((quantity * tax).toFixed(2)),
            finalPrice: parseFloat(finalPrice.toFixed(2)),
            returnRequested: false,
            returnQuantity: 0,
            returnReason: null,
            createdAt: orderDate
          });
        });
        
        const discount = subtotal * 0.05 * Math.random(); // 0-5% order discount
        const tax = (subtotal - discount) * 0.18;
        const totalAmount = subtotal - discount + tax;
        
        const deliveryAddress = getRandomIndianAddress();
        
        // Create order
        orders.push({
          _id: orderObjectId,
          orderId,
          userId: customer.userId,
          customerId: customer._id.toString(),
          customerName: customer.fullName,
          customerEmail: customer.email,
          customerPhone: customer.contactNumber,
          deliveryAddress: {
            recipientName: customer.fullName,
            ...deliveryAddress,
            phone: customer.contactNumber
          },
          subtotal: parseFloat(subtotal.toFixed(2)),
          discount: parseFloat(discount.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          status,
          orderDate,
          estimatedDeliveryDate: status !== 'Cancelled' ? new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000) : null,
          actualDeliveryDate: status === 'Delivered' ? new Date(orderDate.getTime() + randomInt(3, 10) * 24 * 60 * 60 * 1000) : null,
          cancellationInfo: status === 'Cancelled' ? {
            reason: 'Changed my mind',
            cancelledBy: customer.userId,
            cancelledAt: new Date(orderDate.getTime() + randomInt(1, 2) * 24 * 60 * 60 * 1000)
          } : null,
          returnInfo: null,
          notes: Math.random() > 0.7 ? 'Please call before delivery' : null,
          createdAt: orderDate,
          updatedAt: new Date()
        });
        
        // Create order history
        orderHistory.push({
          orderId: orderObjectId,
          orderIdString: orderId,
          previousStatus: null,
          newStatus: 'Placed',
          changedBy: customer.userId,
          changedByRole: 'Customer',
          changedByName: customer.fullName,
          notes: 'Order placed',
          timestamp: orderDate,
          metadata: {}
        });
        
        if (status !== 'Placed') {
          orderHistory.push({
            orderId: orderObjectId,
            orderIdString: orderId,
            previousStatus: 'Placed',
            newStatus: status,
            changedBy: 'SYSTEM',
            changedByRole: 'System',
            changedByName: 'System',
            notes: `Status updated to ${status}`,
            timestamp: new Date(orderDate.getTime() + randomInt(1, 5) * 24 * 60 * 60 * 1000),
            metadata: {}
          });
        }
        
        orderCounter++;
      }
    }
    
    await orderDb.collection('orders').insertMany(orders);
    await orderDb.collection('order_items').insertMany(orderItems);
    await orderDb.collection('order_history').insertMany(orderHistory);
    
    success(`Seeded ${orders.length} orders, ${orderItems.length} order items, ${orderHistory.length} history entries`);
    return orders;
  } catch (err) {
    error('Error seeding orders', err);
    throw err;
  }
}

// Seed CMPS - Complaints, Comments, History
async function seedComplaints() {
  try {
    log(`Seeding ${COMPLAINTS_PER_CUSTOMER} complaints per customer...`);
    
    const customers = await customerDb.collection('customers').find({}).toArray();
    const orders = await orderDb.collection('orders').find({}).toArray();
    const adminUsers = await authDb.collection('users').find({ role: 'Administrator' }).toArray();
    
    const categories = ['Product Quality', 'Delivery Issue', 'Customer Service', 'Payment Issue', 'Other'];
    const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
    const priorities = ['Low', 'Medium', 'High', 'Critical'];
    
    const complaints = [];
    const comments = [];
    const history = [];
    let complaintCounter = 1;
    
    for (const customer of customers) {
      const customerOrders = orders.filter(o => o.customerId === customer._id.toString());
      
      for (let i = 0; i < COMPLAINTS_PER_CUSTOMER; i++) {
        const complaintId = `CMP-2026-${String(complaintCounter).padStart(6, '0')}`;
        const createdAt = randomDate(new Date('2025-06-01'), new Date());
        const status = randomChoice(statuses);
        const priority = randomChoice(priorities);
        const category = randomChoice(categories);
        
        // 70% order-linked, 30% general
        const isOrderLinked = Math.random() > 0.3 && customerOrders.length > 0;
        const linkedOrder = isOrderLinked ? randomChoice(customerOrders) : null;
        
        const complaintObjectId = new mongoose.Types.ObjectId();
        const assignedAdmin = Math.random() > 0.3 ? randomChoice(adminUsers) : null;
        
        // Create complaint
        complaints.push({
          _id: complaintObjectId,
          complaintId,
          userId: customer.userId,
          customerId: customer._id.toString(),
          customerEmail: customer.email,
          customerName: customer.fullName,
          orderId: linkedOrder ? linkedOrder.orderId : null,
          orderIdString: linkedOrder ? linkedOrder.orderId : null,
          category,
          subject: `${category} - ${linkedOrder ? linkedOrder.orderId : 'General Issue'}`,
          description: `I am facing issues with ${category.toLowerCase()}. ${linkedOrder ? `This is regarding order ${linkedOrder.orderId}.` : 'Need assistance to resolve this matter.'} Please help me resolve this at the earliest.`,
          status,
          priority,
          assignedTo: assignedAdmin ? assignedAdmin._id.toString() : null,
          assignedToName: assignedAdmin ? assignedAdmin.fullName : null,
          assignedAt: assignedAdmin ? new Date(createdAt.getTime() + randomInt(1, 24) * 60 * 60 * 1000) : null,
          resolutionNotes: status === 'Resolved' || status === 'Closed' ? 'Issue has been resolved successfully' : null,
          resolvedBy: status === 'Resolved' || status === 'Closed' ? assignedAdmin?._id.toString() : null,
          resolvedByName: status === 'Resolved' || status === 'Closed' ? assignedAdmin?.fullName : null,
          resolvedAt: status === 'Resolved' || status === 'Closed' ? new Date(createdAt.getTime() + randomInt(24, 72) * 60 * 60 * 1000) : null,
          closedBy: status === 'Closed' ? customer.userId : null,
          closedByName: status === 'Closed' ? customer.fullName : null,
          closedAt: status === 'Closed' ? new Date(createdAt.getTime() + randomInt(73, 96) * 60 * 60 * 1000) : null,
          reopenedCount: 0,
          reopenedBy: null,
          reopenedAt: null,
          customerSatisfaction: status === 'Closed' ? randomInt(3, 5) : null,
          tags: [category.toLowerCase().replace(/\s+/g, '-')],
          metadata: {
            ipAddress: `${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}`,
            userAgent: 'Mozilla/5.0',
            platform: 'Web',
            source: 'Web'
          },
          createdAt,
          updatedAt: new Date(),
          updatedBy: customer.userId
        });
        
        // Create history entry
        history.push({
          complaintId: complaintObjectId,
          complaintIdString: complaintId,
          action: 'created',
          previousStatus: null,
          newStatus: 'Open',
          previousAssignee: null,
          newAssignee: null,
          changedBy: customer.userId,
          changedByRole: 'Customer',
          changedByName: customer.fullName,
          notes: 'Complaint created',
          timestamp: createdAt
        });
        
        // Create comments
        for (let j = 0; j < COMMENTS_PER_COMPLAINT; j++) {
          const isCustomerComment = j % 2 === 0;
          const commentUser = isCustomerComment ? customer : (assignedAdmin || randomChoice(adminUsers));
          
          comments.push({
            complaintId: complaintObjectId,
            complaintIdString: complaintId,
            userId: isCustomerComment ? customer.userId : commentUser._id.toString(),
            userName: isCustomerComment ? customer.fullName : commentUser.fullName,
            userRole: isCustomerComment ? 'Customer' : 'Administrator',
            comment: isCustomerComment 
              ? `This is comment ${j + 1} from customer. Still waiting for resolution.`
              : `This is comment ${j + 1} from support team. We are working on your issue.`,
            isInternal: !isCustomerComment && Math.random() > 0.7,
            createdAt: new Date(createdAt.getTime() + (j + 1) * 12 * 60 * 60 * 1000),
            updatedAt: new Date(createdAt.getTime() + (j + 1) * 12 * 60 * 60 * 1000)
          });
        }
        
        complaintCounter++;
      }
    }
    
    await complaintDb.collection('complaints').insertMany(complaints);
    await complaintDb.collection('complaint_comments').insertMany(comments);
    await complaintDb.collection('complaint_history').insertMany(history);
    
    success(`Seeded ${complaints.length} complaints, ${comments.length} comments, ${history.length} history entries`);
  } catch (err) {
    error('Error seeding complaints', err);
    throw err;
  }
}

// Update customer statistics
async function updateCustomerStatistics() {
  try {
    log('Updating customer statistics...');
    
    const customers = await customerDb.collection('customers').find({}).toArray();
    
    for (const customer of customers) {
      const customerId = customer._id.toString();
      
      // Get order stats
      const orders = await orderDb.collection('orders').find({ 
        customerId,
        status: { $nin: ['Cancelled'] }
      }).toArray();
      
      const totalOrders = orders.length;
      const totalOrderValue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const lastOrderDate = orders.length > 0 
        ? new Date(Math.max(...orders.map(o => o.orderDate.getTime())))
        : null;
      
      // Get complaint stats
      const complaints = await complaintDb.collection('complaints').find({ 
        customerId 
      }).toArray();
      
      const totalComplaints = complaints.length;
      const openComplaints = complaints.filter(c => 
        ['Open', 'In Progress', 'Reopened'].includes(c.status)
      ).length;
      const lastComplaintDate = complaints.length > 0
        ? new Date(Math.max(...complaints.map(c => c.createdAt.getTime())))
        : null;
      
      // Update customer
      await customerDb.collection('customers').updateOne(
        { _id: customer._id },
        { 
          $set: {
            totalOrders,
            totalOrderValue: parseFloat(totalOrderValue.toFixed(2)),
            totalComplaints,
            openComplaints,
            lastOrderDate,
            lastComplaintDate,
            updatedAt: new Date()
          }
        }
      );
    }
    
    success('Updated customer statistics');
  } catch (err) {
    error('Error updating customer statistics', err);
    throw err;
  }
}

// Main seeding function
async function seed() {
  try {
    console.log('\n╔═══════════════════════════════════════════════════╗');
    console.log('║   R-MAN E-Commerce Database Seeder               ║');
    console.log('╚═══════════════════════════════════════════════════╝');
    
    await connectDatabase();
    
    // Check if data exists
    const dataExists = await checkDataExists();
    
    if (dataExists && !FORCE_SEEDING) {
      log('⚠️  Data already exists in database');
      log('💡 Set FORCE_SEEDING=true in .env to clear and re-seed');
      return;
    }
    
    if (FORCE_SEEDING) {
      await clearAllData();
    }
    
    // Seed in order
    await seedUsers();
    await seedCustomers();
    await seedOrders();
    await seedComplaints();
    await updateCustomerStatistics();
    
    console.log('\n╔═══════════════════════════════════════════════════╗');
    console.log('║   ✅ Database Seeding Completed Successfully!    ║');
    console.log('╚═══════════════════════════════════════════════════╝');
    console.log('\n📊 Summary:');
    console.log(`   • ${ADMIN_COUNT} Admin Users`);
    console.log(`   • ${CUSTOMER_COUNT} Customer Users`);
    console.log(`   • ${CUSTOMER_COUNT} Customers`);
    console.log(`   • ${CUSTOMER_COUNT * ORDERS_PER_CUSTOMER} Orders`);
    console.log(`   • ${CUSTOMER_COUNT * ORDERS_PER_CUSTOMER * ITEMS_PER_ORDER} Order Items`);
    console.log(`   • ${CUSTOMER_COUNT * COMPLAINTS_PER_CUSTOMER} Complaints`);
    console.log(`   • ${CUSTOMER_COUNT * COMPLAINTS_PER_CUSTOMER * COMMENTS_PER_COMPLAINT} Comments`);
    console.log('\n🔐 Default Login:');
    console.log(`   Email: admin@rman.com`);
    console.log(`   Password: ${DEFAULT_PASSWORD}`);
    console.log('');
    
  } catch (err) {
    error('Seeding failed', err);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      log('Database connection closed');
    }
  }
}

// Run seeder
seed();
