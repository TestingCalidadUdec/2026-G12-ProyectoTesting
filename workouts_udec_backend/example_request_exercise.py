#!/usr/bin/env python3

import requests
import json

# Get admin token
def get_admin_token():
    response = requests.post("http://localhost:8000/api/auth/login", 
                           data={"username": "admin@example.com", "password": "admin123"},
                           headers={"Content-Type": "application/x-www-form-urlencoded"})
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"Login failed: {response.status_code} - {response.text}")
        return None

# Test exercise creation
def test_exercise_creation():
    token = get_admin_token()
    if not token:
        return
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    exercise_data = {
        "name": "Test Exercise",
        "description": "Test description", 
        "exercise_type": "WEIGHT_BASED",
        "muscle_group": "Chest",
        "equipment": "Barbell",
        "instructions": "Test instructions"
    }
    
    print("Sending exercise data:")
    print(json.dumps(exercise_data, indent=2))
    
    response = requests.post("http://localhost:8000/api/exercises/", 
                           headers=headers,
                           json=exercise_data)
    
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Body: {response.text}")
    
    if response.status_code == 422:
        try:
            error_detail = response.json()
            print("\nValidation Errors:")
            print(json.dumps(error_detail, indent=2))
        except:
            pass

if __name__ == "__main__":
    test_exercise_creation()