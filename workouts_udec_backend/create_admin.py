#!/usr/bin/env python3

"""
Script to create an admin user for the workout tracker application.
Run this after setting up the database to create your first admin user.
"""

from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.user import User

def create_admin_user():
    db = SessionLocal()
    
    # Check if admin user already exists
    admin_user = db.query(User).filter(User.email == "admin@example.com").first()
    if admin_user:
        print("Admin user already exists!")
        return
    
    # Create admin user
    admin_user = User(
        email="admin@example.com",
        username="admin",
        hashed_password=get_password_hash("admin123"),
        full_name="System Administrator",
        is_active=True,
        is_admin=True
    )
    
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    print("Admin user created successfully!")
    print("Email: admin@example.com")
    print("Password: admin123")
    print("Please change the password after first login!")
    
    db.close()

if __name__ == "__main__":
    create_admin_user()