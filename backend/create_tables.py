# backend/create_tables.py
import os, sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "app")))
from app.db import engine, Base
import app.models  # register models with Base
Base.metadata.create_all(bind=engine)
print("Tables created (if not already present).")
