"""
Pytest Configuration and Fixtures
Shared fixtures for all integration tests
"""
import pytest
import asyncio
from config import Config
from utils.client import BaseTestClient
from utils.data_generator import TestDataGenerator
from utils.helpers import login_user, register_user


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def aths_client():
    """ATHS service client"""
    client = BaseTestClient(Config.ATHS.url, Config.REQUEST_TIMEOUT)
    yield client
    await client.close()


@pytest.fixture(scope="session")
async def crms_client():
    """CRMS service client"""
    client = BaseTestClient(Config.CRMS.url, Config.REQUEST_TIMEOUT)
    yield client
    await client.close()


@pytest.fixture(scope="session")
async def orms_client():
    """ORMS service client"""
    client = BaseTestClient(Config.ORMS.url, Config.REQUEST_TIMEOUT)
    yield client
    await client.close()


@pytest.fixture(scope="session")
async def cmps_client():
    """CMPS service client"""
    client = BaseTestClient(Config.CMPS.url, Config.REQUEST_TIMEOUT)
    yield client
    await client.close()


@pytest.fixture(scope="session")
async def admin_token(aths_client):
    """Get admin JWT token"""
    token = await login_user(
        aths_client,
        Config.ADMIN_USER["email"],
        Config.ADMIN_USER["password"]
    )
    assert token is not None, "Failed to login as admin"
    return token


@pytest.fixture
async def test_customer_user(aths_client):
    """Create and return test customer user"""
    user_data = TestDataGenerator.generate_user_data(role="Customer")
    created_user = await register_user(aths_client, user_data)
    assert created_user is not None, "Failed to register test customer"
    
    # Store password for login
    created_user["password"] = user_data["password"]
    return created_user


@pytest.fixture
async def test_customer_token(aths_client, test_customer_user):
    """Get JWT token for test customer"""
    token = await login_user(
        aths_client,
        test_customer_user["email"],
        test_customer_user["password"]
    )
    assert token is not None, "Failed to login test customer"
    return token


@pytest.fixture
def test_data_generator():
    """Test data generator instance"""
    return TestDataGenerator()


@pytest.fixture
def service_api_key():
    """Service API key for internal endpoints"""
    return Config.SERVICE_API_KEY
