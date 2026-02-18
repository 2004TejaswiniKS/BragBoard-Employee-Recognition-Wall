import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context
from dotenv import load_dotenv

# -------------------------------------------------------------------
# Make sure Alembic can import your app modules
# (backend/app is one folder above this env.py)
# -------------------------------------------------------------------
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Load .env file
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# This is the Alembic Config object
config = context.config

# Set up Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# -------------------------------------------------------------------
# Load DATABASE_URL from .env and inject into Alembic config
# -------------------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL missing in .env file")

config.set_main_option("sqlalchemy.url", DATABASE_URL)

# -------------------------------------------------------------------
# Import Base metadata from your models
# -------------------------------------------------------------------
from app.models import Base  # <-- Base = declarative_base() inside db.py
target_metadata = Base.metadata


# -------------------------------------------------------------------
# Offline migrations (generates SQL scripts only)
# -------------------------------------------------------------------
def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


# -------------------------------------------------------------------
# Online migrations (applies migrations to database)
# -------------------------------------------------------------------
def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


# -------------------------------------------------------------------
# Invoke correct mode
# -------------------------------------------------------------------
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
