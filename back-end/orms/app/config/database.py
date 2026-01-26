"""
Database Configuration
MongoDB connection and index management
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config.settings import settings
from app.utils.logger import info, error


class Database:
    """MongoDB database manager"""
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None
    
    @classmethod
    async def connect_db(cls):
        """Connect to MongoDB and create indexes"""
        try:
            cls.client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                minPoolSize=settings.MONGODB_MIN_POOL_SIZE,
                maxPoolSize=settings.MONGODB_MAX_POOL_SIZE
            )
            
            # Extract database name from URI
            db_name = "r-man-orders-db"
            cls.db = cls.client[db_name]
            
            # Test connection
            await cls.client.admin.command('ping')
            info(f"✅ MongoDB Connected: {cls.client.address[0]}:{cls.client.address[1]}")
            info(f"📦 Database Name: {db_name}")
            
            # Create indexes
            await cls.create_indexes()
            info("✅ Database indexes created successfully")
            
        except Exception as e:
            error(f"❌ MongoDB connection failed: {str(e)}")
            raise
    
    @classmethod
    async def disconnect_db(cls):
        """Disconnect from MongoDB"""
        if cls.client:
            cls.client.close()
            info("MongoDB connection closed")
    
    @classmethod
    async def create_indexes(cls):
        """Create all database indexes"""
        
        # Orders collection indexes
        await cls.db.orders.create_index("orderId", unique=True)
        await cls.db.orders.create_index("userId")
        await cls.db.orders.create_index("customerId")
        await cls.db.orders.create_index("status")
        await cls.db.orders.create_index([("orderDate", -1)])
        await cls.db.orders.create_index([("userId", 1), ("status", 1)])
        await cls.db.orders.create_index([("orderDate", -1), ("status", 1)])
        await cls.db.orders.create_index([
            ("orderId", "text"),
            ("customerEmail", "text"),
            ("customerName", "text")
        ])
        
        # Order items collection indexes
        await cls.db.order_items.create_index("orderId")
        await cls.db.order_items.create_index("productId")
        await cls.db.order_items.create_index("returnRequested")
        
        # Order history collection indexes
        await cls.db.order_history.create_index("orderId")
        await cls.db.order_history.create_index([("timestamp", -1)])
        await cls.db.order_history.create_index([("orderId", 1), ("timestamp", -1)])
        
        # Return requests collection indexes
        await cls.db.return_requests.create_index("orderId")
        await cls.db.return_requests.create_index("userId")
        await cls.db.return_requests.create_index("status")
        await cls.db.return_requests.create_index([("requestedAt", -1)])


async def get_database() -> AsyncIOMotorDatabase:
    """Dependency to get database instance"""
    return Database.db
