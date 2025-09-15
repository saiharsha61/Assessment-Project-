# config.py
# Configuration for Flask, JWT, and PostgreSQL

import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-jwt-secret-key')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'postgresql://user:password@localhost:5432/assessment_db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
  
