"""
MongoDB Database Configuration
Manages database connection using Motor (async MongoDB driver)
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import IndexModel, ASCENDING, DESCENDING, TEXT
from app.config.settings import settings
from app.utils.logger import info, error


class Database:
    """MongoDB database connection manager"""
    
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None
    
    @classmethod
    async def connect_db(cls):
        """Establish database connection"""
        try:
            cls.client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                minPoolSize=settings.MONGODB_MIN_POOL_SIZE,
                maxPoolSize=settings.MONGODB_MAX_POOL_SIZE,
                serverSelectionTimeoutMS=5000
            )
            
            # Get database name from URI or use default
            db_name = "r-man-customers-db"
            cls.db = cls.client[db_name]
            
            # Test connection
            await cls.client.admin.command('ping')
            
            info(f"✅ MongoDB Connected: {cls.client.address[0]}")
            info(f"📦 Database Name: {db_name}")
            
            # Create indexes
            await cls.create_indexes()
            
        except Exception as e:
            error(f"❌ Failed to connect to MongoDB: {str(e)}")
            raise
    
    @classmethod
    async def disconnect_db(cls):
        """Close database connection"""
        if cls.client:
            cls.client.close()
            info("MongoDB connection closed")
    
    @classmethod
    async def create_indexes(cls):
        """Create database indexes for customers collection"""
        try:
            customers_collection = cls.db.customers
            
            indexes = [
                # Unique index on userId
                IndexModel([("userId", ASCENDING)], unique=True, name="userId_unique"),
                
                # Index on email for quick lookup
                IndexModel([("email", ASCENDING)], name="email_index"),
                
                # Index on customerStatus for filtering
                IndexModel([("customerStatus", ASCENDING)], name="customerStatus_index"),
                
                # Index on customerType for filtering
                IndexModel([("customerType", ASCENDING)], name="customerType_index"),
                
                # Compound index for active customers
                IndexModel(
                    [("customerStatus", ASCENDING), ("customerType", ASCENDING)],
                    name="status_type_compound"
                ),
                
                # Text index for searching
                IndexModel(
                    [("fullName", TEXT), ("email", TEXT), ("contactNumber", TEXT)],
                    name="search_text_index"
                ),
                
                # Index on lastOrderDate for sorting
                IndexModel([("lastOrderDate", DESCENDING)], name="lastOrderDate_index"),
                
                # Index on totalOrderValue for high-value customer queries
                IndexModel([("totalOrderValue", DESCENDING)], name="totalOrderValue_index"),
                
                # Index on createdAt for chronological queries
                IndexModel([("createdAt", DESCENDING)], name="createdAt_index"),
            ]
            
            await customers_collection.create_indexes(indexes)
            info("✅ Database indexes created successfully")
            
        except Exception as e:
            error(f"Failed to create indexes: {str(e)}")
            raise
    
    @classmethod
    def get_db(cls) -> AsyncIOMotorDatabase:
        """Get database instance"""
        if cls.db is None:
            raise RuntimeError("Database not initialized. Call connect_db() first.")
        return cls.db


# Dependency for FastAPI routes
async def get_database() -> AsyncIOMotorDatabase:
    """Dependency to get database instance in routes"""
    return Database.get_db()
