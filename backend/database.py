from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Load .env file - check both root and backend directories
env_path = os.path.join(os.path.dirname(__file__), '.env')
if not os.path.exists(env_path):
    # Try parent directory (for deployment scenarios)
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')

load_dotenv(env_path)

# Connection string from environment variable - never hardcode secrets
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# engine = the connection pool
engine = create_engine(DATABASE_URL)
# SessionLocal = a factory for DB sessions
SessionLocal = sessionmaker(bind=engine, autoflush=False)

# Base = all ORM models inherit from this
Base = declarative_base()

# create all tables
def init_db() -> None:
    """Create all SQLAlchemy tables for the configured database."""
    import models.user
    import models.trip
    import models.conversation
    Base.metadata.create_all(bind=engine)