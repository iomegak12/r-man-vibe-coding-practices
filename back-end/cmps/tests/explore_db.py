"""
List all databases and collections to find the data
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient


async def main():
    client = AsyncIOMotorClient("mongodb://admin:password123@localhost:27017/?authSource=admin")
    
    print("=" * 60)
    print("MongoDB Database Explorer")
    print("=" * 60)
    
    # List all databases
    db_list = await client.list_database_names()
    print(f"\n📚 Available Databases ({len(db_list)}):")
    for db_name in db_list:
        print(f"   - {db_name}")
    
    # Check each database for collections
    for db_name in db_list:
        if db_name in ['admin', 'config', 'local']:
            continue
        
        db = client[db_name]
        collections = await db.list_collection_names()
        
        print(f"\n📊 Database: {db_name}")
        print(f"   Collections ({len(collections)}):")
        
        for coll_name in collections:
            count = await db[coll_name].count_documents({})
            print(f"   - {coll_name}: {count} documents")
            
            # Show sample document
            if count > 0:
                sample = await db[coll_name].find_one()
                print(f"     Sample keys: {list(sample.keys())[:8]}")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
