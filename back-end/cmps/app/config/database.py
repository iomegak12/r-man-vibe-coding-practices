"""Database configuration and connection management"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config.settings import settings
from app.utils.logger import info, error
from typing import Optional


class Database:
    """MongoDB database connection manager"""
    
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    
    @classmethod
    async def connect_db(cls):
        """Establish database connection and create indexes"""
        try:
            info(f"Connecting to MongoDB: {settings.MONGODB_URI.split('@')[1] if '@' in settings.MONGODB_URI else 'localhost'}")
            
            cls.client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                minPoolSize=settings.MONGODB_MIN_POOL_SIZE,
                maxPoolSize=settings.MONGODB_MAX_POOL_SIZE
            )
            
            # Extract database name from URI
            db_name = settings.MONGODB_URI.split('/')[-1].split('?')[0]
            cls.db = cls.client[db_name]
            
            # Test connection
            await cls.client.admin.command('ping')
            info(f"✅ MongoDB Connected: {settings.MONGODB_URI.split('@')[1] if '@' in settings.MONGODB_URI else 'localhost'}")
            info(f"📦 Database Name: {db_name}")
            
            # Create indexes
            await cls.create_indexes()
            info("✅ Database indexes created successfully")
            
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
        """Create all required database indexes"""
        if cls.db is None:
            return
        
        # Complaints Collection Indexes
        complaints = cls.db.complaints
        
        # Unique index on complaintId
        await complaints.create_index("complaintId", unique=True)
        
        # Index on userId for customer's complaints
        await complaints.create_index("userId")
        
        # Index on customerId
        await complaints.create_index("customerId")
        
        # Index on orderId for order-linked complaints
        await complaints.create_index("orderId")
        
        # Index on status for filtering
        await complaints.create_index("status")
        
        # Index on category for filtering
        await complaints.create_index("category")
        
        # Index on priority for filtering
        await complaints.create_index("priority")
        
        # Index on assignedTo for admin's assigned complaints
        await complaints.create_index("assignedTo")
        
        # Index on createdAt for chronological queries
        await complaints.create_index([("createdAt", -1)])
        
        # Compound index for open complaints by priority
        await complaints.create_index([("status", 1), ("priority", -1)])
        
        # Compound index for assigned complaints
        await complaints.create_index([("assignedTo", 1), ("status", 1)])
        
        # Text index for searching
        await complaints.create_index([
            ("complaintId", "text"),
            ("subject", "text"),
            ("description", "text"),
            ("customerEmail", "text"),
            ("customerName", "text")
        ])
        
        # Complaint Comments Collection Indexes
        comments = cls.db.complaint_comments
        
        # Index on complaintId for fetching comments
        await comments.create_index("complaintId")
        
        # Index on userId for user's comments
        await comments.create_index("userId")
        
        # Index on createdAt for chronological order
        await comments.create_index("createdAt")
        
        # Compound index for complaint comments chronologically
        await comments.create_index([("complaintId", 1), ("createdAt", 1)])
        
        # Index on isInternal for filtering internal comments
        await comments.create_index("isInternal")
        
        # Complaint History Collection Indexes
        history = cls.db.complaint_history
        
        # Index on complaintId for history lookup
        await history.create_index("complaintId")
        
        # Index on timestamp for chronological queries
        await history.create_index([("timestamp", -1)])
        
        # Compound index for complaint history chronologically
        await history.create_index([("complaintId", 1), ("timestamp", -1)])
        
        # Index on action for action-based queries
        await history.create_index("action")
        
        # Complaint Assignments Collection Indexes
        assignments = cls.db.complaint_assignments
        
        # Index on complaintId
        await assignments.create_index("complaintId")
        
        # Index on assignedTo for admin's assignments
        await assignments.create_index("assignedTo")
        
        # Index on isActive for active assignments
        await assignments.create_index("isActive")
        
        # Compound index for active assignments by admin
        await assignments.create_index([("assignedTo", 1), ("isActive", 1)])


async def get_database() -> AsyncIOMotorDatabase:
    """Dependency to get database instance"""
    return Database.db
